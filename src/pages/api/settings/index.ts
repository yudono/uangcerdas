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

    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { settings: true },
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({
                profileName: user.name || '',
                profileEmail: user.email || '',
                currency: user.settings?.currency || 'IDR',
                timezone: user.settings?.timezone || 'Asia/Jakarta',
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'PUT') {
        const { profileName, profileEmail, currency, timezone } = req.body;

        try {
            // Update User Profile
            if (profileName || profileEmail) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        name: profileName,
                        email: profileEmail,
                    },
                });
            }

            // Update or Create User Settings
            if (currency || timezone) {
                await prisma.userSetting.upsert({
                    where: { userId },
                    update: {
                        currency: currency,
                        timezone: timezone,
                    },
                    create: {
                        userId,
                        currency: currency || 'IDR',
                        timezone: timezone || 'Asia/Jakarta',
                    },
                });
            }

            return res.status(200).json({ message: 'Settings updated successfully' });
        } catch (error) {
            console.error('Error updating settings:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
