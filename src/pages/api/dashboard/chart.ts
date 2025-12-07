import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';

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
            // Get transactions for the last 7 days
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today

            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0); // Start of 7 days ago

            const transactions = await prisma.transaction.findMany({
                where: {
                    businessId: business.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            // Group by day
            const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            const chartData = [];

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dayName = days[d.getDay()];
                const dateStr = d.toISOString().split('T')[0];

                const dayTransactions = transactions.filter(t => t.date.toISOString().split('T')[0] === dateStr);

                const income = dayTransactions
                    .filter(t => t.type === 'in')
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                const expense = dayTransactions
                    .filter(t => t.type === 'out')
                    .reduce((sum, t) => sum + Number(t.amount), 0);

                chartData.push({
                    name: dayName,
                    income,
                    expense
                });
            }

            return res.status(200).json(chartData);
        } catch (error) {
            console.error('Error generating chart data:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
