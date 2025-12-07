
import { getChatHistory, upsertMessage, milvusClient } from '../src/lib/milvus';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const userId = "test-user-" + Date.now();
    console.log("Testing Milvus Chat History for user:", userId);

    try {
        console.log("0. Checking connection...");
        await milvusClient.checkHealth();
        console.log("Connection successful!");

        console.log("1. Upserting user message...");
        await upsertMessage(userId, 'user', 'Hello, this is a test message.');

        console.log("2. Upserting assistant message...");
        await upsertMessage(userId, 'assistant', 'Hi there! I am a test bot.');

        console.log("3. Waiting for 2 seconds to ensure consistency...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log("4. Fetching chat history...");
        const history = await getChatHistory(userId);

        console.log("History retrieved:", history);

        if (history.length === 2) {
            console.log("SUCCESS: Retrieved 2 messages.");
        } else {
            console.error(`FAILURE: Expected 2 messages, got ${history.length}`);
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        // Clean up if needed, or leave for inspection
        // await milvusClient.closeConnection(); // SDK might not have closeConnection exposed directly on client instance depending on version
        process.exit(0);
    }
}

main();
