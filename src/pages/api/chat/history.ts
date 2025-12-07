import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { getChatHistory } from '@/src/lib/milvus';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions) as any;

        if (!session || !session.user?.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = session.user.id;
        const history = await getChatHistory(userId);

        return res.status(200).json({ history });

    } catch (error: any) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
