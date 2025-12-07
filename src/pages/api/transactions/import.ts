import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';
import * as XLSX from 'xlsx';
import formidable from 'formidable';
import fs from 'fs';
import { upsertTransaction } from '@/src/lib/milvus';
import { AnomalyService } from '@/src/lib/anomaly-service';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions) as any;
        if (!session || !session.user?.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = session.user.id;
        const business = await prisma.business.findFirst({ where: { userId } });

        if (!business) {
            return res.status(400).json({ message: 'Business not found' });
        }

        const form = formidable();

        const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        const file = files.file?.[0];
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const buffer = fs.readFileSync(file.filepath);
        const wb = XLSX.read(buffer, { type: 'buffer' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Get headers from the first row
        const headers = (data[0] || []).map((h: any) => String(h).toLowerCase().trim());

        // Helper to find index by possible header names
        const findIndex = (possibleNames: string[]) => {
            return headers.findIndex((h: string) => possibleNames.includes(h));
        };

        const idxDate = findIndex(['date', 'tanggal', 'tgl']);
        const idxDesc = findIndex(['description', 'deskripsi', 'keterangan', 'uraian']);
        const idxAmount = findIndex(['amount', 'amount (idr)', 'jumlah', 'nominal', 'nilai']);
        const idxType = findIndex(['type', 'tipe', 'jenis', 'flow']);
        const idxCategory = findIndex(['category', 'kategori']);

        // Check if required columns are found
        if (idxDate === -1 || idxDesc === -1 || idxAmount === -1 || idxType === -1) {
            return res.status(400).json({
                message: 'Missing required columns in header. Please ensure your file has: Date, Description, Amount, Type, Category',
                missingColumns: {
                    Date: idxDate === -1,
                    Description: idxDesc === -1,
                    Amount: idxAmount === -1,
                    Type: idxType === -1
                }
            });
        }

        // Skip header row
        const rows = data.slice(1);
        const validTransactions = [];
        const errors = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const dateStr = row[idxDate];
            const desc = row[idxDesc];
            const amount = row[idxAmount];
            const typeRaw = row[idxType];
            const category = idxCategory !== -1 ? row[idxCategory] : 'Uncategorized';

            const type = (typeRaw ? String(typeRaw) : '').toLowerCase();

            // Validation
            if (!dateStr || !desc || !amount || !type) {
                errors.push(`Row ${i + 2}: Missing required fields`);
                continue;
            }

            // Handle Excel serial date or string date
            let date: Date;
            if (typeof dateStr === 'number') {
                // Excel serial date
                date = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
            } else {
                date = new Date(dateStr);
            }

            if (isNaN(date.getTime())) {
                errors.push(`Row ${i + 2}: Invalid date format`);
                continue;
            }

            // Clean amount string (remove currency symbols, commas, etc if string)
            let cleanAmount = amount;
            if (typeof amount === 'string') {
                cleanAmount = amount.replace(/[^0-9.-]+/g, "");
            }

            if (isNaN(Number(cleanAmount))) {
                errors.push(`Row ${i + 2}: Invalid amount`);
                continue;
            }

            if (type !== 'in' && type !== 'out') {
                // Try to infer from Indonesian
                if (type === 'masuk' || type === 'income' || type === 'pemasukan') {
                    // type = 'in'; // const is read-only, need to handle this
                } else if (type === 'keluar' || type === 'expense' || type === 'pengeluaran') {
                    // type = 'out';
                } else {
                    errors.push(`Row ${i + 2}: Invalid type (must be 'in' or 'out')`);
                    continue;
                }
            }

            // Normalize type
            let finalType = type;
            if (['masuk', 'income', 'pemasukan'].includes(type)) finalType = 'in';
            if (['keluar', 'expense', 'pengeluaran'].includes(type)) finalType = 'out';

            validTransactions.push({
                businessId: business.id,
                date: date,
                description: desc,
                amount: Number(cleanAmount),
                type: finalType,
                category: category || 'Lainnya',
                status: 'completed',
            });
        }

        if (validTransactions.length > 0) {
            // Bulk Insert
            await prisma.transaction.createMany({
                data: validTransactions,
            });

            // Sync to Milvus (Optional: can be slow for large imports, maybe background job)
            // For now, let's try to sync a few or skip to avoid timeout
            // Or just fire and forget
            Promise.all(validTransactions.map(t => upsertTransaction({ ...t, id: 'temp-id-for-vector' })))
                .catch(e => console.error("Milvus sync error during import", e));

            // Trigger Anomaly Detection
            AnomalyService.runDetectionForBusiness(business.id).catch(err => console.error("Anomaly detection failed:", err));
        }

        return res.status(200).json({
            message: 'Import processed',
            successCount: validTransactions.length,
            errors: errors
        });

    } catch (error) {
        console.error('Error importing transactions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
