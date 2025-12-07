import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/src/lib/prisma';
import { authOptions } from '@/src/lib/auth';
import { llm } from '@/src/lib/ai';
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

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
        const business = await prisma.business.findFirst({ where: { userId } });

        if (!business) {
            return res.status(200).json({ insight: "Belum ada data bisnis untuk dianalisis." });
        }

        // Fetch recent transactions for context
        // Define startOfMonth and endOfMonth for the new query
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const transactions = await prisma.transaction.findMany({
            where: {
                businessId: business.id,
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            orderBy: { date: 'desc' },
        });

        if (transactions.length === 0) {
            return res.status(200).json({ insight: "Belum ada transaksi untuk dianalisis. Mulai catat keuangan Anda!" });
        }

        // Calculate simplified stats for the prompt
        const income = transactions
            .filter(t => t.type === 'in')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = transactions
            .filter(t => t.type === 'out')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const topCategory = transactions
            .filter(t => t.type === 'out')
            .sort((a, b) => Number(b.amount) - Number(a.amount))[0]?.category || 'None';

        const summary = `Total Income: ${income}, Total Expense: ${expense}, Net: ${income - expense}, Top Spending Category: ${topCategory}. Recent transactions included various items.`;

        const prompt = `Analyze this financial summary for a small business: "${summary}". Provide a concise, friendly, and actionable insight (max 2 sentences) in Indonesian language about their financial health or spending.`;

        const response = await llm.invoke([
            new SystemMessage("You are a helpful financial assistant for small businesses."),
            new HumanMessage(prompt)
        ]);

        const insight = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

        return res.status(200).json({ insight });

    } catch (error: any) {
        console.error('Error generating insight:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
