
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        process.exit(1);
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: apiKey,
        modelName: "embedding-001",
    });

    try {
        const vector = await embeddings.embedQuery("Hello world");
        console.log("Embedding dimension:", vector.length);
    } catch (error) {
        console.error("Error generating embedding:", error);
    }
}

main();
