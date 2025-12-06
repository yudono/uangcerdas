import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions) as any;

    if (!session || !session.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = session.user.id;

    // Get user's business (assuming single business for now)
    const business = await prisma.business.findFirst({
        where: { userId },
    });

    if (!business) {
        // For now, if no business exists, we can't do anything. 
        // In a real app, we might create a default one or redirect to onboarding.
        return res.status(400).json({ message: 'No business found for user' });
    }

    const businessId = business.id;

    if (req.method === 'GET') {
        try {
            const transactions = await prisma.cashflow.findMany({
                where: { businessId },
                include: {
                    category: true,
                },
                orderBy: {
                    transactionDate: 'desc',
                },
            });

            // Map to frontend Transaction type
            const formattedTransactions = transactions.map((tx) => ({
                id: tx.id,
                date: tx.transactionDate.toISOString(), // Or format as needed
                desc: tx.description || '',
                category: tx.category.categoryName,
                amount: Number(tx.amount),
                type: tx.cashflowType, // 'in' | 'out'
                source: 'Manual', // Defaulting to Manual as sourceBatchId might be null
                status: 'completed', // Default status
            }));

            return res.status(200).json(formattedTransactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'POST') {
        const { date, desc, category, amount, type, source } = req.body;

        if (!date || !amount || !type || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            // Find or create category
            let categoryRecord = await prisma.cashflowCategory.findFirst({
                where: { categoryName: category },
            });

            if (!categoryRecord) {
                categoryRecord = await prisma.cashflowCategory.create({
                    data: { categoryName: category },
                });
            }

            const newTransaction = await prisma.cashflow.create({
                data: {
                    businessId,
                    categoryId: categoryRecord.id,
                    transactionDate: new Date(date),
                    cashflowType: type,
                    amount: amount,
                    description: desc,
                    // sourceBatchId: source === 'Import' ? ... : null // Handle source if needed
                },
                include: {
                    category: true,
                },
            });

            const formattedTransaction = {
                id: newTransaction.id,
                date: newTransaction.transactionDate.toISOString(),
                desc: newTransaction.description || '',
                category: newTransaction.category.categoryName,
                amount: Number(newTransaction.amount),
                type: newTransaction.cashflowType,
                source: source || 'Manual',
                status: 'completed',
            };

            return res.status(201).json(formattedTransaction);
        } catch (error) {
            console.error('Error creating transaction:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
