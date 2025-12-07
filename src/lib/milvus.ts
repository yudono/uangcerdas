import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const MILVUS_URL = process.env.MILVUS_URL || "144.91.103.249:19530";
const MILVUS_TOKEN = process.env.MILVUS_TOKEN;
const COLLECTION_NAME = "transactions_v2"; // Renamed for schema update (dim 768)

// Parse URL to handle https and ssl
const address = MILVUS_URL.replace(/^https?:\/\//, "");
const ssl = MILVUS_URL.startsWith("https://") || MILVUS_URL.includes("zilliz.com");

// Initialize Milvus Client
// Note: In a real app, you might want to handle connection pooling or singleton better.
export const milvusClient = new MilvusClient({
    address: address,
    token: MILVUS_TOKEN,
    ssl: ssl,
});

// Initialize Embeddings
// Kolosal API doesn't list embedding models, so we fallback to Gemini for embeddings.
const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

console.log("Milvus Service: Using Gemini Embeddings");

let embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: geminiKey,
    modelName: "embedding-001",
});

export async function ensureCollection() {
    const hasCollection = await milvusClient.hasCollection({
        collection_name: COLLECTION_NAME,
    });

    if (!hasCollection.value) {
        await milvusClient.createCollection({
            collection_name: COLLECTION_NAME,
            fields: [
                {
                    name: "id",
                    description: "Transaction ID",
                    data_type: DataType.VarChar,
                    max_length: 64,
                    is_primary_key: true,
                },
                {
                    name: "user_id",
                    description: "User ID",
                    data_type: DataType.VarChar,
                    max_length: 64,
                },
                {
                    name: "vector",
                    description: "Transaction Embedding",
                    data_type: DataType.FloatVector,
                    dim: 768, // Gemini embedding-001 dimension
                },
                {
                    name: "text",
                    description: "Transaction Description",
                    data_type: DataType.VarChar,
                    max_length: 2048,
                },
                {
                    name: "metadata",
                    description: "Transaction Metadata (JSON string)",
                    data_type: DataType.VarChar,
                    max_length: 4096,
                },
            ],
        });

        // Create index
        await milvusClient.createIndex({
            collection_name: COLLECTION_NAME,
            field_name: "vector",
            index_name: "vector_index",
            index_type: "IVF_FLAT",
            metric_type: "L2",
            params: { nlist: 1024 },
        });

        await milvusClient.loadCollectionSync({
            collection_name: COLLECTION_NAME,
        });
    }
}

export async function upsertTransaction(transaction: any) {
    await ensureCollection();

    // Handle both old Cashflow (nested category) and new Transaction (flat category)
    const categoryName = typeof transaction.category === 'string' ? transaction.category : transaction.category?.categoryName || 'Uncategorized';
    const type = transaction.type || transaction.cashflowType;
    const date = transaction.date || transaction.transactionDate;

    // Ensure we have a user_id. If transaction object doesn't have it (e.g. from create result), 
    // we might need to fetch it or pass it. 
    // For now, assuming transaction has business.userId OR we pass it.
    // If business is not included, we might fail. 
    // Ideally, the caller should provide the full object or we fetch it here.
    // Let's assume the caller will ensure business.userId is available or we use a fallback/error.
    const userId = transaction.business?.userId || transaction.userId; // Add userId to Transaction model if needed or include business

    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const text = `${dateStr} - ${transaction.description} - ${transaction.amount} - ${categoryName} - ${type}`;
    const vector = await embeddings.embedQuery(text);

    const data = {
        id: transaction.id,
        user_id: userId,
        vector: vector,
        text: text,
        metadata: JSON.stringify({
            amount: Number(transaction.amount),
            date: date,
            category: categoryName,
            type: type,
            description: transaction.description,
        }),
    };

    await milvusClient.upsert({
        collection_name: COLLECTION_NAME,
        fields_data: [data],
    });
}

export async function deleteTransaction(id: string) {
    await ensureCollection();
    await milvusClient.delete({
        collection_name: COLLECTION_NAME,
        filter: `id == "${id}"`,
    });
}

export async function searchTransactions(userId: string, query: string, limit = 5) {
    await ensureCollection();

    const vector = await embeddings.embedQuery(query);

    const searchRes = await milvusClient.search({
        collection_name: COLLECTION_NAME,
        data: vector,
        filter: `user_id == "${userId}"`,
        limit: limit,
        output_fields: ["text", "metadata"],
    });

    return searchRes.results;
}

export async function searchChatHistory(userId: string, query: string, limit = 5) {
    await ensureChatCollection();

    const vector = await embeddings.embedQuery(query);

    const searchRes = await milvusClient.search({
        collection_name: CHAT_COLLECTION_NAME,
        data: vector,
        filter: `user_id == "${userId}"`,
        limit: limit,
        output_fields: ["role", "content", "timestamp"],
    });

    return searchRes.results;
}

const CHAT_COLLECTION_NAME = "chat_history_v2"; // Renamed for schema update (dim 768)

export async function ensureChatCollection() {
    const hasCollection = await milvusClient.hasCollection({
        collection_name: CHAT_COLLECTION_NAME,
    });

    if (!hasCollection.value) {
        await milvusClient.createCollection({
            collection_name: CHAT_COLLECTION_NAME,
            fields: [
                {
                    name: "id",
                    description: "Message ID",
                    data_type: DataType.VarChar,
                    max_length: 64,
                    is_primary_key: true,
                },
                {
                    name: "user_id",
                    description: "User ID",
                    data_type: DataType.VarChar,
                    max_length: 64,
                },
                {
                    name: "role",
                    description: "Role (user/assistant)",
                    data_type: DataType.VarChar,
                    max_length: 16,
                },
                {
                    name: "content",
                    description: "Message Content",
                    data_type: DataType.VarChar,
                    max_length: 8192, // Increased limit for longer messages
                },
                {
                    name: "vector",
                    description: "Content Embedding",
                    data_type: DataType.FloatVector,
                    dim: 768, // Gemini embedding-001 dimension
                },
                {
                    name: "timestamp",
                    description: "Timestamp",
                    data_type: DataType.Int64,
                },
            ],
        });

        await milvusClient.createIndex({
            collection_name: CHAT_COLLECTION_NAME,
            field_name: "vector",
            index_name: "chat_vector_index",
            index_type: "IVF_FLAT",
            metric_type: "L2",
            params: { nlist: 1024 },
        });

        await milvusClient.loadCollectionSync({
            collection_name: CHAT_COLLECTION_NAME,
        });
    }
}

export async function upsertMessage(userId: string, role: 'user' | 'assistant', content: string) {
    await ensureChatCollection();

    console.log(`Upserting message for user ${userId}, role ${role}`);
    try {
        const vector = await embeddings.embedQuery(content);
        const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

        await milvusClient.upsert({
            collection_name: CHAT_COLLECTION_NAME,
            fields_data: [{
                id,
                user_id: userId,
                role,
                content,
                vector,
                timestamp: Date.now(),
            }],
        });
        console.log("Message upserted to Milvus");
    } catch (error) {
        console.error("Error in upsertMessage:", error);
        throw error;
    }
}



export async function getChatHistory(userId: string, limit = 50) {
    await ensureChatCollection();

    // Query for messages from this user, sorted by timestamp
    const queryRes = await milvusClient.query({
        collection_name: CHAT_COLLECTION_NAME,
        filter: `user_id == "${userId}"`,
        output_fields: ["id", "role", "content", "timestamp"],
        limit: limit,
    });

    // Sort by timestamp ascending
    return queryRes.data.sort((a: any, b: any) => Number(a.timestamp) - Number(b.timestamp));
}
