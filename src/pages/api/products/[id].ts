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

    // Verify ownership
    const product = await prisma.product.findUnique({
        where: { id },
        include: { business: true },
    });

    if (!product || product.business.userId !== session.user.id) {
        return res.status(404).json({ message: 'Product not found' });
    }

    if (req.method === 'PUT') {
        const { name, price, stock, unit } = req.body;

        try {
            const updatedProduct = await prisma.product.update({
                where: { id },
                data: {
                    name,
                    price: price ? Number(price) : undefined,
                    stock: stock !== undefined ? Number(stock) : undefined,
                    unit,
                },
            });
            return res.status(200).json(updatedProduct);
        } catch (error) {
            console.error('Error updating product:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await prisma.product.delete({
                where: { id },
            });
            return res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
