import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions) as any;

    if (!session || !session.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    // Verify transaction belongs to user's business
    const userId = session.user.id;
    const business = await prisma.business.findFirst({
        where: { userId },
    });

    if (!business) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const transaction = await prisma.cashflow.findUnique({
        where: { id },
    });

    if (!transaction || transaction.businessId !== business.id) {
        return res.status(404).json({ message: 'Transaction not found' });
    }

    if (req.method === 'PUT') {
        const { date, desc, category, amount, type, source } = req.body;

        try {
            let categoryId = transaction.categoryId;
            if (category) {
                let categoryRecord = await prisma.cashflowCategory.findFirst({
                    where: { categoryName: category },
                });

                if (!categoryRecord) {
                    categoryRecord = await prisma.cashflowCategory.create({
                        data: { categoryName: category },
                    });
                }
                categoryId = categoryRecord.id;
            }

            const updatedTransaction = await prisma.cashflow.update({
                where: { id },
                data: {
                    transactionDate: date ? new Date(date) : undefined,
                    description: desc,
                    amount: amount,
                    cashflowType: type,
                    categoryId: categoryId,
                },
                include: {
                    category: true,
                },
            });

            const formattedTransaction = {
                id: updatedTransaction.id,
                date: updatedTransaction.transactionDate.toISOString(),
                desc: updatedTransaction.description || '',
                category: updatedTransaction.category.categoryName,
                amount: Number(updatedTransaction.amount),
                type: updatedTransaction.cashflowType,
                source: source || 'Manual', // Preserve or update source
                status: 'completed',
            };

            return res.status(200).json(formattedTransaction);
        } catch (error) {
            console.error('Error updating transaction:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await prisma.cashflow.delete({
                where: { id },
            });
            return res.status(204).end();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
