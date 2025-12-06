import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Seed default categories
    const categories = ['Penjualan', 'Bahan Baku', 'Operasional', 'Gaji', 'Pencairan', 'Kas', 'Maintenance', 'Lainnya'];
    const categoryMap = new Map<string, string>();

    for (const categoryName of categories) {
        let category = await prisma.cashflowCategory.findFirst({
            where: { categoryName },
        });

        if (!category) {
            category = await prisma.cashflowCategory.create({
                data: { categoryName },
            });
            console.log(`Created category: ${categoryName}`);
        }
        categoryMap.set(categoryName, category.id);
    }

    // 2. Create Demo User
    const demoEmail = 'demo@smartkas.com';
    let user = await prisma.user.findUnique({
        where: { email: demoEmail },
    });

    if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await prisma.user.create({
            data: {
                email: demoEmail,
                name: 'Demo User',
                fullname: 'Demo User SmartKas',
                password: hashedPassword,
            },
        });
        console.log(`Created demo user: ${demoEmail}`);
    } else {
        console.log(`Demo user already exists: ${demoEmail}`);
    }

    // 3. Create Business for Demo User
    let business = await prisma.business.findFirst({
        where: { userId: user.id },
    });

    if (!business) {
        business = await prisma.business.create({
            data: {
                userId: user.id,
                businessName: 'SmartKas Demo Business',
                businessType: 'General',
            },
        });
        console.log(`Created business: ${business.businessName}`);
    }

    // 4. Create Cashflows (Transactions)
    const cashflowCount = await prisma.cashflow.count({
        where: { businessId: business.id },
    });

    if (cashflowCount === 0) {
        await prisma.cashflow.createMany({
            data: [
                {
                    businessId: business.id,
                    categoryId: categoryMap.get('Penjualan')!,
                    transactionDate: new Date(),
                    cashflowType: 'in',
                    amount: 5000000,
                    description: 'Pendapatan Proyek A',
                },
                {
                    businessId: business.id,
                    categoryId: categoryMap.get('Operasional')!,
                    transactionDate: new Date(),
                    cashflowType: 'out',
                    amount: 1500000,
                    description: 'Sewa Server',
                },
                {
                    businessId: business.id,
                    categoryId: categoryMap.get('Gaji')!,
                    transactionDate: new Date(new Date().setDate(new Date().getDate() - 5)),
                    cashflowType: 'out',
                    amount: 2500000,
                    description: 'Gaji Freelancer',
                },
            ],
        });
        console.log('Created sample cashflows');
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
