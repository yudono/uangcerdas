import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';
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
            const alerts = await prisma.alert.findMany({
                where: { businessId: business.id },
                orderBy: { date: 'desc' }
            });

            const formattedAlerts = alerts.map(alert => ({
                ...alert,
                date: alert.date.toISOString().split('T')[0],
                amount: alert.amount ? Number(alert.amount) : undefined,
                createdAt: alert.createdAt.toISOString(),
                updatedAt: alert.updatedAt.toISOString()
            }));

            return res.status(200).json(formattedAlerts);
        } catch (error) {
            console.error('Error generating alerts:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
