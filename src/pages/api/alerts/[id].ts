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
        return res.status(400).json({ message: 'Invalid alert ID' });
    }

    if (req.method === 'PATCH') {
        try {
            const { status, userNotes } = req.body;

            // Verify ownership
            const alert = await prisma.alert.findUnique({
                where: { id },
                include: { business: true }
            });

            if (!alert) {
                return res.status(404).json({ message: 'Alert not found' });
            }

            if (alert.business.userId !== session.user.id) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const updatedAlert = await prisma.alert.update({
                where: { id },
                data: {
                    ...(status && { status }),
                    ...(userNotes !== undefined && { userNotes }),
                },
            });

            return res.status(200).json(updatedAlert);
        } catch (error) {
            console.error('Error updating alert:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
