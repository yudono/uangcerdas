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
            // Aggregate cashflow by month for the last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
            sixMonthsAgo.setDate(1); // Start of the month

            const transactions = await prisma.cashflow.findMany({
                where: {
                    businessId: business.id,
                    transactionDate: { gte: sixMonthsAgo },
                },
                orderBy: { transactionDate: 'asc' },
            });

            // Group by month
            const monthlyData = new Map<string, number>();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

            // Initialize last 6 months
            for (let i = 0; i < 6; i++) {
                const d = new Date();
                d.setMonth(d.getMonth() - (5 - i));
                const monthName = months[d.getMonth()];
                monthlyData.set(monthName, 0);
            }

            transactions.forEach(tx => {
                const monthIndex = tx.transactionDate.getMonth();
                const monthName = months[monthIndex];

                if (monthlyData.has(monthName)) {
                    let currentVal = monthlyData.get(monthName) || 0;
                    if (tx.cashflowType === 'in') {
                        currentVal += Number(tx.amount);
                    } else {
                        currentVal -= Number(tx.amount);
                    }
                    monthlyData.set(monthName, currentVal);
                }
            });

            const chartData = Array.from(monthlyData.entries()).map(([name, val]) => ({
                name,
                val,
                color: val >= 0 ? '#10b981' : '#ef4444', // Green for positive, Red for negative
            }));

            // Add a prediction for next month (simple +10% growth)
            const lastMonthVal = chartData[chartData.length - 1].val;
            const nextMonthDate = new Date();
            nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
            const nextMonthName = months[nextMonthDate.getMonth()];

            chartData.push({
                name: `${nextMonthName} (Est)`,
                val: lastMonthVal * 1.1,
                color: '#34d399',
                isPrediction: true,
            } as any);

            return res.status(200).json(chartData);
        } catch (error) {
            console.error('Error generating report:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
