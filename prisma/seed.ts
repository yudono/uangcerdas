import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Reconstruct __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Initialize Milvus Client Locally
    let milvusClient: any = null;
    let embeddings: any = null;
    try {
        const { MilvusClient } = await import("@zilliz/milvus2-sdk-node");
        const { OpenAIEmbeddings } = await import("@langchain/openai");
        const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");

        const MILVUS_URL = process.env.MILVUS_URL || "144.91.103.249:19530";
        const MILVUS_TOKEN = process.env.MILVUS_TOKEN;

        // Parse URL to handle https and ssl
        const address = MILVUS_URL.replace(/^https?:\/\//, "");
        const ssl = MILVUS_URL.startsWith("https://") || MILVUS_URL.includes("zilliz.com");

        milvusClient = new MilvusClient({
            address: address,
            token: MILVUS_TOKEN,
            ssl: ssl
        });

        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: geminiKey,
            modelName: "embedding-001",
        });
        console.log("Milvus client initialized with Gemini embeddings.");
    } catch (err) {
        console.error("Error initializing Milvus:", err);
        console.warn("Failed to initialize Milvus client. Seeding will proceed without vector sync.");
    }

    // Helper for retry logic
    async function retry<T>(fn: () => Promise<T>, retries = 10, delay = 5000): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) throw error;
            console.warn(`Operation failed, retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retry(fn, retries - 1, delay * 1.5);
        }
    }

    // 0. Clear existing data
    console.log('Clearing existing data...');
    await retry(() => prisma.transaction.deleteMany({}));

    // Reset Milvus Collection
    if (milvusClient) {
        try {
            const { DataType } = await import("@zilliz/milvus2-sdk-node");
            console.log('Attempting to reset Milvus collection...');
            console.log('Attempting to reset Milvus collection...');
            await milvusClient.dropCollection({ collection_name: "transactions_v2" });
            console.log('Dropped Milvus collection: transactions_v2');

            // Re-create collection with correct dimension for Gemini embedding-001 (768)
            await milvusClient.createCollection({
                collection_name: "transactions_v2",
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
            console.log('Created Milvus collection: transactions_v2');

            // Create index
            await milvusClient.createIndex({
                collection_name: "transactions_v2",
                field_name: "vector",
                index_name: "vector_index",
                index_type: "IVF_FLAT",
                metric_type: "L2",
                params: { nlist: 1024 },
            });
            console.log('Created Milvus index');

            await milvusClient.loadCollectionSync({
                collection_name: "transactions_v2",
            });
            console.log('Loaded Milvus collection');

        } catch (e) {
            console.warn('Warning: Failed to reset/create Milvus collection. Is Milvus running? Continuing with DB seed...', e);
        }
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

    // 4. Create Transactions from CSV
    const transactionCount = await retry(() => prisma.transaction.count({
        where: { businessId: business.id },
    }));

    if (transactionCount === 0) {
        const csvPath = path.join(__dirname, '../bank_transactions_data_2.csv');
        console.log(`Reading transactions from ${csvPath}...`);

        try {
            const csvData = fs.readFileSync(csvPath, 'utf-8');
            const lines = csvData.split('\n');
            // Skip header
            const dataLines = lines.slice(1).filter((line: string) => line.trim() !== '');

            console.log(`Found ${dataLines.length} transactions to seed.`);

            // Prepare data for bulk insert
            const transactionsToInsert: any[] = [];

            console.log('Parsing CSV data...');
            for (const line of dataLines) {
                const cols = line.split(',');
                if (cols.length < 5) continue;

                const id = cols[0]; // Use TransactionID from CSV
                const amount = parseFloat(cols[2]);
                const dateStr = cols[3];
                const typeStr = cols[4];
                const location = cols[5];

                const type = typeStr === 'Debit' ? 'out' : 'in';
                const category = typeStr === 'Debit' ? 'Operasional' : 'Penjualan';

                transactionsToInsert.push({
                    id: id, // Explicitly set ID
                    businessId: business.id,
                    category: category,
                    date: new Date(dateStr),
                    type: type,
                    amount: amount,
                    description: `Transaction at ${location}`,
                    status: 'completed',
                });
            }

            // Bulk Insert to DB
            console.log(`Inserting ${transactionsToInsert.length} transactions to Database...`);
            await retry(() => prisma.transaction.createMany({
                data: transactionsToInsert,
                skipDuplicates: true,
            }));
            console.log('Database insert finished.');

            // Bulk Sync to Milvus
            if (milvusClient && embeddings) {
                console.log('Starting Milvus sync...');

                try {
                    // Bulk embed all texts
                    const texts = transactionsToInsert.map(t => `${t.description} - ${t.amount} - ${t.category} - ${t.type}`);
                    const vectors = await embeddings.embedDocuments(texts);

                    const fields_data = transactionsToInsert.map((t, idx) => ({
                        id: t.id,
                        user_id: business.userId,
                        vector: vectors[idx],
                        text: texts[idx],
                        metadata: JSON.stringify({
                            amount: Number(t.amount),
                            date: t.date,
                            category: t.category,
                            type: t.type,
                        }),
                    }));

                    // Insert all into Milvus
                    // Milvus might have a limit on message size (usually 64MB), 2500 records should be fine.
                    // Insert all into Milvus
                    // Milvus might have a limit on message size (usually 64MB), 2500 records should be fine.
                    await milvusClient.upsert({
                        collection_name: "transactions_v2",
                        fields_data: fields_data,
                    });

                    console.log(`Synced all ${transactionsToInsert.length} transactions to Milvus.`);
                } catch (err) {
                    console.error(`Failed to sync to Milvus:`, err);
                }
            }

            console.log('Seeding finished.');
        } catch (error) {
            console.error('Error reading or processing CSV:', error);
        }
    } else {
        console.log('Transactions already exist, skipping CSV seed.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
