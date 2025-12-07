import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { searchTransactions, upsertMessage, searchChatHistory } from "./milvus";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { prisma } from "./prisma";
import { AnomalyService } from "./anomaly-service";

// Initialize LLM (Kolosal AI as default)
// Gemini is used for STT (Transcribe) only.
const kolosalKey = process.env.KOLOSAL_API_KEY || "dummy";

export const llm = new ChatOpenAI({
    apiKey: kolosalKey, // Explicitly pass apiKey
    configuration: {
        baseURL: "https://api.kolosal.ai/v1",
        apiKey: kolosalKey, // Also in configuration just in case
    },
    modelName: "Llama 4 Maverick",
    temperature: 0,
});

// --- AGENT & TOOLS ---

export async function processChat(userId: string, message: string) {
    console.log("processChat started for user:", userId);

    // 1. Define Tools with userId injected (Closure)
    const analyzeTransactionTool = new DynamicStructuredTool({
        name: "analyze_transactions",
        description: "Analyze user transactions to answer questions. Use this for ANY question about expenses, income, history, or specific transaction details. It performs a search and then analyzes the results.",
        schema: z.object({
            query: z.string().describe("The search query, e.g., 'coffee', 'salary', 'highest expense'"),
        }),
        func: async ({ query }) => {
            try {
                // 1. Fetch User Settings (Currency)
                const userSetting = await prisma.userSetting.findUnique({ where: { userId } });
                const currency = userSetting?.currency || "IDR";
                const locale = currency === "IDR" ? "id-ID" : "en-US";

                // 2. Search Transactions
                // Increase limit to get more context for analysis
                const results = await searchTransactions(userId, query, 20);

                if (results.length === 0) {
                    return "No transactions found matching your query.";
                }

                // 3. Helper to format currency
                const format = (amount: number) => {
                    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
                };

                // 4. Batch Processing
                const BATCH_SIZE = 10;
                const batches = [];
                for (let i = 0; i < results.length; i += BATCH_SIZE) {
                    batches.push(results.slice(i, i + BATCH_SIZE));
                }

                let aggregatedAnalysis = "";

                for (const batch of batches) {
                    const batchContent = batch.map((r: any) => {
                        const meta = JSON.parse(r.metadata);
                        // Use structured metadata for clearer AI analysis
                        return `- Tanggal: ${meta.date}, Deskripsi: ${meta.description || r.text}, Jumlah: ${format(meta.amount)}, Kategori: ${meta.category}, Tipe: ${meta.type}`;
                    }).join("\n");

                    // Analyze this batch
                    const analysis = await llm.invoke([
                        new SystemMessage(`You are a financial analyst. Analyze these transactions based on the user's query: "${query}". 
                        Focus on extracting relevant insights, totals, or specific details. 
                        If the batch doesn't contain relevant info, say so.
                        Currency: ${currency}.`),
                        new HumanMessage(batchContent)
                    ]);

                    aggregatedAnalysis += analysis.content + "\n---\n";
                }

                // 5. Final Synthesis (if multiple batches or just to clean up)
                if (batches.length > 1) {
                    const finalSynthesis = await llm.invoke([
                        new SystemMessage(`Synthesize the following partial analyses into a single, coherent answer to the user's query: "${query}".
                        Currency: ${currency}.
                        Speak Indonesian.`),
                        new HumanMessage(aggregatedAnalysis)
                    ]);
                    return finalSynthesis.content as string;
                }

                return aggregatedAnalysis; // Return the single batch analysis directly

            } catch (error) {
                console.error("Error analyzing transactions:", error);
                return "Error analyzing transactions.";
            }
        },
    });

    const checkAnomaliesTool = new DynamicStructuredTool({
        name: "check_anomalies",
        description: "Check for financial anomalies or alerts. Use this when user asks about fraud, unusual spending, or alerts.",
        schema: z.object({}), // No input needed, userId is injected
        func: async () => {
            try {
                const business = await prisma.business.findFirst({ where: { userId } });
                if (!business) return "No business found for this user.";

                const alerts = await prisma.alert.findMany({
                    where: { businessId: business.id },
                    orderBy: { date: 'desc' },
                    take: 5
                });

                if (alerts.length === 0) return "No anomalies detected recently.";
                return JSON.stringify(alerts);
            } catch (error) {
                return "Error checking anomalies.";
            }
        },
    });

    const saveTransactionTool = new DynamicStructuredTool({
        name: "save_transaction",
        description: "Save a new transaction (expense or income). Use this when user explicitly asks to record/save a transaction.",
        schema: z.object({
            amount: z.number().describe("The amount of the transaction"),
            type: z.enum(["in", "out"]).describe("Type: 'in' for income, 'out' for expense"),
            description: z.string().describe("Description of the transaction"),
            category: z.string().optional().describe("Category (e.g., 'Food', 'Transport', 'Salary')"),
        }),
        func: async ({ amount, type, description, category }) => {
            try {
                const business = await prisma.business.findFirst({ where: { userId } });
                if (!business) return "No business found. Cannot save transaction.";

                const transaction = await prisma.transaction.create({
                    data: {
                        businessId: business.id,
                        amount,
                        type,
                        description,
                        category: category || "Lainnya",
                        date: new Date(),
                        status: "completed"
                    }
                });
                return `Transaction saved successfully: ${type === 'in' ? 'Income' : 'Expense'} Rp${amount} - ${description}`;
            } catch (error) {
                return "Error saving transaction.";
            }
        },
    });

    // 2. Create Agent Executor for this request
    const agentExecutor = createReactAgent({
        llm,
        tools: [analyzeTransactionTool, checkAnomaliesTool, saveTransactionTool],
    });

    // 3. Save User Message to Milvus
    try {
        await upsertMessage(userId, 'user', message);
    } catch (e) {
        console.error("Failed to save user message to Milvus, continuing...", e);
    }

    // 4. Retrieve Context (Chat History)
    console.log("Retrieving chat history...");
    const history = await searchChatHistory(userId, message, 5);
    console.log(`Found ${history.length} history items`);

    const contextMessages = history.map(h =>
        h.role === 'user' ? new HumanMessage(h.content) : new AIMessage(h.content)
    );

    // 5. Invoke Agent
    console.log("Invoking Agent...");
    try {
        const result = await agentExecutor.invoke({
            messages: [
                new SystemMessage("You are SmartKas, a helpful financial assistant. Use your tools to answer questions about transactions, check for anomalies, or save new transactions. Speak Indonesian. Do NOT ask for userId, it is handled automatically."),
                ...contextMessages,
                new HumanMessage(message)
            ],
        });
        console.log("Agent finished execution");

        const lastMessage = result.messages[result.messages.length - 1];
        const reply = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);

        // 6. Save Assistant Reply to Milvus
        await upsertMessage(userId, 'assistant', reply);

        return reply;
    } catch (error) {
        console.error("Error invoking agent:", error);
        throw error;
    }
}
