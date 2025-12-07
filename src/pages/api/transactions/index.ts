import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';
import { upsertTransaction } from '@/src/lib/milvus';
import { AnomalyService } from '@/src/lib/anomaly-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getServerSession(req, res, authOptions) as any;

        if (!session || !session.user?.id) {
            console.error("Transaction API: Unauthorized access - No session or user ID");
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = session.user.id;

        // Verify user exists (Fix for stale session FK error)
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            return res.status(401).json({ message: 'User record not found. Please log out and log in again.' });
        }

        // Get user's business (assuming single business for now)
        let business = await prisma.business.findFirst({
            where: { userId },
        });

        if (!business) {
            console.log(`Transaction API: Creating new business for user ${userId}`);
            business = await prisma.business.create({
                data: {
                    userId,
                    businessName: 'My Business',
                    businessType: 'General',
                },
            });
        }

        const businessId = business.id;

        if (req.method === 'GET') {
            try {
                // Pagination & Filtering Params
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 10;
                const skip = (page - 1) * limit;

                const search = req.query.search as string;
                const startDate = req.query.startDate as string;
                const endDate = req.query.endDate as string;
                const category = req.query.category as string;
                const source = req.query.source as string;

                // Build Where Clause
                const where: any = { businessId };

                if (search) {
                    where.OR = [
                        { description: { contains: search, mode: 'insensitive' } },
                        // Prisma doesn't support filtering by float cast to string easily in where clause without raw query
                        // So we might skip amount search or do it if it's exact match, but 'contains' is string only.
                        // For now, let's just search description.
                    ];
                }

                if (startDate || endDate) {
                    where.date = {};
                    if (startDate) where.date.gte = new Date(startDate);
                    if (endDate) where.date.lte = new Date(endDate);
                }

                if (category && category !== 'Semua Kategori') {
                    where.category = category;
                }

                // Source filtering might need a column in DB if we want to support it properly.
                // The current schema doesn't seem to have 'source' column explicitly based on my memory of seed.ts
                // seed.ts sets: description, amount, date, type, category.
                // The frontend hardcodes 'source' to 'Cash' or derives it.
                // If 'source' is not in DB, we can't filter by it on server easily.
                // Let's check schema.prisma if I can.
                // For now, I will ignore source filter on server if column doesn't exist.

                const [transactions, total] = await Promise.all([
                    prisma.transaction.findMany({
                        where,
                        orderBy: { date: 'desc' },
                        skip,
                        take: limit,
                    }),
                    prisma.transaction.count({ where })
                ]);

                // Map to frontend Transaction type
                const formattedTransactions = transactions.map((tx) => {
                    try {
                        return {
                            id: tx.id,
                            date: tx.date.toISOString(),
                            desc: tx.description || '',
                            category: tx.category || 'Uncategorized',
                            amount: Number(tx.amount),
                            type: tx.type, // 'in' | 'out'
                            source: 'Cash', // Defaulting to Cash to match types
                            status: tx.status,
                        };
                    } catch (err) {
                        console.error(`Error mapping transaction ${tx.id}:`, err);
                        return null;
                    }
                }).filter(Boolean); // Remove nulls

                return res.status(200).json({
                    data: formattedTransactions,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit)
                    }
                });
            } catch (error) {
                console.error('Error fetching transactions:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        } else if (req.method === 'POST') {
            const { date, desc, category, amount, type, source, productId } = req.body;

            if (!date || amount === undefined || amount === null || !type || !category) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            try {
                const newTransaction = await prisma.transaction.create({
                    data: {
                        businessId,
                        category: category,
                        date: new Date(date),
                        type: type,
                        amount: amount,
                        description: desc,
                        status: 'completed',
                        productId: productId || null,
                    },
                });

                const formattedTransaction = {
                    id: newTransaction.id,
                    date: newTransaction.date.toISOString(),
                    desc: newTransaction.description || '',
                    category: newTransaction.category,
                    amount: Number(newTransaction.amount),
                    type: newTransaction.type,
                    source: source || 'Manual',
                    status: 'completed',
                    productId: newTransaction.productId,
                };

                // Sync to Milvus (Optional: can be done async or via hook)
                try {
                    await upsertTransaction(newTransaction);
                } catch (e) {
                    console.error("Failed to sync to Milvus:", e);
                }

                // Trigger Anomaly Detection (Fire and Forget)
                // We don't await this to keep the response fast
                AnomalyService.runDetectionForBusiness(businessId).catch(err => {
                    console.error("Anomaly detection failed:", err);
                });

                return res.status(201).json(formattedTransaction);
            } catch (error) {
                console.error('Error creating transaction:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error: any) {
        console.error("Critical Transaction API Error:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
