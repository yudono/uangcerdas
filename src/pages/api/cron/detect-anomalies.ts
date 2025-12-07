import { NextApiRequest, NextApiResponse } from 'next';
import { AnomalyService } from '@/src/lib/anomaly-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // In a real production environment, you should verify a secret key here
    // if (req.query.secret !== process.env.CRON_SECRET) return res.status(401).end();

    try {
        const totalAnomalies = await AnomalyService.runDetection();
        return res.status(200).json({ message: 'Anomaly detection complete', anomaliesFound: totalAnomalies });

    } catch (error: any) {
        console.error('Anomaly Detection Error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
