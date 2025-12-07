import { prisma } from '@/src/lib/prisma';
import { AIService } from '@/src/lib/ai-service';
import { IsolationForest } from 'isolation-forest';

export class AnomalyService {
    static async runDetection() {
        // Fetch all businesses
        // Fetch top 5 businesses that haven't been checked in the last 24 hours
        const businesses = await prisma.business.findMany({
            where: {
                // OR: [
                //     { lastAnomalyCheck: null },
                //     { lastAnomalyCheck: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
                // ]
            },
            take: 5, // Process only 5 at a time to avoid timeouts
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

            // Prepare data for Isolation Forest (using amount as the main feature)
            // Isolation Forest expects an array of objects
            const dataPoints = business.transactions.map(t => {
                return { amount: Number(t.amount) };
            });

            // Train Isolation Forest
            const forest = new IsolationForest();
            forest.fit(dataPoints);

            // Predict anomalies (scores)
            const scores = forest.scores();

            console.log(`Business ${business.id}: ${scores.length} transactions processed.`);
            console.log('Anomaly Scores:', scores.slice(0, 10)); // Log first 10 scores

            // Filter transactions with high anomaly scores (e.g., top 5% or threshold)
            // Isolation Forest scores are usually between 0 and 1. Closer to 1 is more anomalous.
            const threshold = 0.5; // Lowered to 0.5 to catch more potential anomalies

            const anomalousIndices = scores
                .map((score, index) => ({ score, index }))
                .filter(item => item.score > threshold)
                .map(item => item.index);

            if (anomalousIndices.length > 0) {
                // Get the actual anomalous transactions
                const anomalousTransactions = anomalousIndices.map(index => business.transactions[index]);

                // Prepare data for AI to generate insights for these specific anomalies
                const simplifiedAnomalies = anomalousTransactions.map(t => ({
                    date: t.date.toISOString().split('T')[0],
                    amount: Number(t.amount),
                    type: t.type,
                    category: t.category,
                    description: t.description
                }));

                // Use AI to enrich the alert (generate title, description, recommendation)
                // We pass ONLY the detected anomalies to the AI to explain WHY they are anomalies
                const aiInsights = await AIService.detectAnomalies(simplifiedAnomalies);

                if (aiInsights.length > 0) {
                    totalAnomalies += aiInsights.length;

                    // Save alerts to DB (Check for duplicates first)
                    for (const anomaly of aiInsights) {
                        // Check if similar alert exists in last 24 hours
                        const existingAlert = await prisma.alert.findFirst({
                            where: {
                                businessId: business.id,
                                title: anomaly.title,
                                createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                            }
                        });

                        if (!existingAlert) {
                            await prisma.alert.create({
                                data: {
                                    businessId: business.id,
                                    title: anomaly.title,
                                    description: anomaly.description,
                                    severity: anomaly.severity,
                                    status: 'new',
                                    amount: anomaly.amount,
                                    recommendation: anomaly.recommendation,
                                    impact: anomaly.impact,
                                    suggestedActions: anomaly.suggestedActions,
                                    date: new Date()
                                }
                            });
                            totalAnomalies++;
                        }
                    }
                }
            }
            // Update lastAnomalyCheck
            await prisma.business.update({
                where: { id: business.id },
                data: { lastAnomalyCheck: new Date() }
            });
        }

        return totalAnomalies;
    }
}
