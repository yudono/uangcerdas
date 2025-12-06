import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '../auth/[...nextauth]';
import { AIAlert } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions) as any;

    if (!session || !session.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = session.user.id;
    const business = await prisma.business.findFirst({
        where: { userId },
    });

    if (!business) {
        return res.status(400).json({ message: 'No business found' });
    }

    if (req.method === 'GET') {
        try {
            // 1. Fetch recent transactions (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const transactions = await prisma.cashflow.findMany({
                where: {
                    businessId: business.id,
                    transactionDate: { gte: thirtyDaysAgo },
                    cashflowType: 'out', // Focus on expenses for anomalies
                },
                orderBy: { transactionDate: 'desc' },
            });

            const alerts: AIAlert[] = [];

            if (transactions.length > 0) {
                // Calculate average expense
                const totalExpense = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
                const avgExpense = totalExpense / transactions.length;

                // Rule 1: High Expense Anomaly (> 2x average)
                const highExpenseThreshold = avgExpense * 2;

                transactions.forEach(tx => {
                    const amount = Number(tx.amount);
                    if (amount > highExpenseThreshold) {
                        alerts.push({
                            id: `alert-${tx.id}`,
                            severity: amount > avgExpense * 3 ? 'high' : 'medium',
                            title: 'Pengeluaran Tidak Biasa',
                            description: `Transaksi "${tx.description}" sebesar Rp ${amount.toLocaleString()} jauh di atas rata-rata (Rp ${avgExpense.toLocaleString()}).`,
                            date: tx.transactionDate.toISOString().split('T')[0],
                            amount: `-Rp ${amount.toLocaleString()}`,
                            recommendation: 'Cek kembali detail transaksi ini. Pastikan bukan kesalahan input atau kecurangan.',
                            suggestedActions: ['Verifikasi Bukti Pembayaran', 'Tanya Penanggung Jawab'],
                            status: 'new',
                            impact: `Selisih Rp ${(amount - avgExpense).toLocaleString()}`,
                        });
                    }
                });
            }

            // Mock some "Smart" alerts if no real anomalies found, to show the feature working
            if (alerts.length === 0) {
                alerts.push({
                    id: "mock-1",
                    severity: "low",
                    title: "Analisis Rutin Aman",
                    description: "Tidak ditemukan anomali signifikan dalam 30 hari terakhir.",
                    date: new Date().toISOString().split('T')[0],
                    recommendation: "Pertahankan pencatatan yang rapi.",
                    suggestedActions: ["Cek Laporan Bulanan"],
                    status: "resolved",
                });
            }

            return res.status(200).json(alerts);
        } catch (error) {
            console.error('Error generating alerts:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
