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
    const business = await prisma.business.findFirst({
        where: { userId },
    });

    if (!business) {
        return res.status(400).json({ message: 'No business found' });
    }

    if (req.method === 'GET') {
        try {
            const products = await prisma.product.findMany({
                where: { businessId: business.id },
                orderBy: { name: 'asc' },
            });
            return res.status(200).json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'POST') {
        const { name, price, stock, unit } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Name and Price are required' });
        }

        try {
            const product = await prisma.product.create({
                data: {
                    businessId: business.id,
                    name,
                    price: Number(price),
                    stock: Number(stock) || 0,
                    unit: unit || 'pcs',
                },
            });
            return res.status(201).json(product);
        } catch (error) {
            console.error('Error creating product:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
