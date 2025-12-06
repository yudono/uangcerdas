import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const session = await getServerSession(req, res, authOptions) as any;

    if (!session || !session.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = session.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.password) {
            return res.status(404).json({ message: 'User not found or no password set' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return res.status(400).json({ message: 'Kata sandi saat ini salah' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
