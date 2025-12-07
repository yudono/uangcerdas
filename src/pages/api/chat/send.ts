import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';
import { processChat } from '@/src/lib/ai';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions) as any;
        if (!session || !session.user?.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = session.user.id;

        // Ensure business exists (legacy check)
        let business = await prisma.business.findFirst({ where: { userId } });
        if (!business) {
            business = await prisma.business.create({
                data: {
                    userId,
                    businessName: 'My Business',
                    businessType: 'General',
                },
            });
        }

        const { messages, image_url } = req.body;

        if (!messages || messages.length === 0) {
            return res.status(400).json({ message: 'Messages are required' });
        }

        // Get the latest user message
        const lastUserMessage = messages[messages.length - 1];
        let userContent = lastUserMessage.content;

        // If there's an image, append it to the content (LangGraph/LLM might handle it differently, 
        // but for now we append URL or description if we had vision capability in the agent.
        // Since we are using text-based LangGraph tools primarily, we might just pass the text.
        // If image_url is present, we could potentially use a vision tool or just mention it.)
        if (image_url) {
            userContent += ` [Image attached: ${image_url}]`;
        }

        // Process chat using LangGraph Agent
        const reply = await processChat(userId, userContent);

        return res.status(200).json({ reply });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
