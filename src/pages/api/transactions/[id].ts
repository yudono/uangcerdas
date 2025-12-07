import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';
import { upsertTransaction, deleteTransaction } from '@/src/lib/milvus';
import { AnomalyService } from '@/src/lib/anomaly-service';


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

    // The original transaction check is removed as the new GET/PUT/DELETE handlers
    // will perform their own checks or assume the transactionId is valid within the business context.
    // If a global check is still needed, it should be re-added before the method-specific logic.

    if (req.method === 'GET') {
        try {
            const transaction = await prisma.transaction.findUnique({
                where: { id: id as string },
            });

            if (!transaction || transaction.businessId !== business.id) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            return res.status(200).json(transaction);
        } catch (error) {
            console.error('Error fetching transaction:', error); // Added error logging
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'PUT') {
        const { date, desc, category, amount, type, source, productId } = req.body;

        try {
            // Check if the transaction exists and belongs to the user's business before updating
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: id as string },
            });

            if (!existingTransaction || existingTransaction.businessId !== business.id) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            const updatedTransaction = await prisma.transaction.update({
                where: { id: id as string },
                data: {
                    date: date ? new Date(date) : undefined, // Allow date to be optional or keep existing
                    description: desc,
                    category,
                    amount: amount ? Number(amount) : undefined, // Ensure amount is number
                    type,
                    productId: productId || null,
                },
            });

            // Update Milvus
            try {
                await upsertTransaction(updatedTransaction);
            } catch (e) {
                console.error("Failed to update Milvus:", e);
            }

            // Trigger Anomaly Detection
            AnomalyService.runDetectionForBusiness(business.id).catch(err => console.error("Anomaly detection failed:", err));

            return res.status(200).json(updatedTransaction);
        } catch (error) {
            console.error('Error updating transaction:', error); // Added error logging
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'DELETE') {
        try {
            // Check if the transaction exists and belongs to the user's business before deleting
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: id as string },
            });

            if (!existingTransaction || existingTransaction.businessId !== business.id) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            await prisma.transaction.delete({
                where: { id: id as string },
            });

            // Delete from Milvus (if implemented)
            try {
                await deleteTransaction(id as string);
            } catch (e) {
                console.error("Failed to delete from Milvus:", e);
            }


            // Trigger Anomaly Detection
            AnomalyService.runDetectionForBusiness(business.id).catch(err => console.error("Anomaly detection failed:", err));

            return res.status(200).json({ message: 'Transaction deleted' });
        } catch (error) {
            console.error('Error deleting transaction:', error); // Added error logging
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
