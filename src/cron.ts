import cron from 'node-cron';
import { AnomalyService } from './lib/anomaly-service';

console.log('Starting Anomaly Detection Cron Job...');

// Schedule task to run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled anomaly detection...`);
    try {
        const count = await AnomalyService.runDetection();
        console.log(`[${new Date().toISOString()}] Detection complete. Found ${count} anomalies.`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error running anomaly detection:`, error);
    }
});

console.log('Cron job scheduled: Runs every 30 minutes.');
