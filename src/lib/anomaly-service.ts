import { prisma } from '@/src/lib/prisma';
import { AIService } from '@/src/lib/ai-service';

export class AnomalyService {
    static async runDetection() {
        // Fetch all businesses
        const businesses = await prisma.business.findMany({
            include: {
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 50 // Analyze last 50 transactions
                }
            }
        });

        let totalAnomalies = 0;

        for (const business of businesses) {
            if (business.transactions.length < 5) continue; // Skip if not enough data

            // Prepare data for AI (simplify to save tokens)
            const simplifiedTransactions = business.transactions.map(t => ({
                date: t.date.toISOString().split('T')[0],
                amount: Number(t.amount),
                type: t.type,
                category: t.category,
                description: t.description
            }));

            // Detect anomalies
            const anomalies = await AIService.detectAnomalies(simplifiedTransactions);

            if (anomalies.length > 0) {
                totalAnomalies += anomalies.length;

                // Save alerts to DB
                await prisma.alert.createMany({
                    data: anomalies.map((a: any) => ({
                        businessId: business.id,
                        title: a.title,
                        description: a.description,
                        severity: a.severity,
                        status: 'new',
                        amount: a.amount,
                        recommendation: a.recommendation,
                        impact: a.impact,
                        suggestedActions: a.suggestedActions,
                        date: new Date()
                    }))
                });
            }
        }

        return totalAnomalies;
    }
}
