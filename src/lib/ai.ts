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
    openAIApiKey: kolosalKey,
    configuration: {
        baseURL: "https://api.kolosal.ai/v1",
    },
    modelName: "Llama 4 Maverick",
    temperature: 0,
});

// --- TOOLS ---

const searchTransactionsTool = new DynamicStructuredTool({
    name: "search_transactions",
    description: "Search for user transactions. Use this to answer questions about expenses, income, history, or specific transaction details.",
    schema: z.object({
        query: z.string().describe("The search query, e.g., 'coffee', 'salary', 'highest expense'"),
        userId: z.string().describe("The user ID"),
    }),
    func: async ({ query, userId }) => {
        try {
            const results = await searchTransactions(userId, query);
            return JSON.stringify(results);
        } catch (error) {
            return "Error searching transactions.";
        }
    },
});

const checkAnomaliesTool = new DynamicStructuredTool({
    name: "check_anomalies",
    description: "Check for financial anomalies or alerts. Use this when user asks about fraud, unusual spending, or alerts.",
    schema: z.object({
        userId: z.string().describe("The user ID"),
    }),
    func: async ({ userId }) => {
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
        userId: z.string().describe("The user ID"),
        amount: z.number().describe("The amount of the transaction"),
        type: z.enum(["in", "out"]).describe("Type: 'in' for income, 'out' for expense"),
        description: z.string().describe("Description of the transaction"),
        category: z.string().optional().describe("Category (e.g., 'Food', 'Transport', 'Salary')"),
    }),
    func: async ({ userId, amount, type, description, category }) => {
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

// --- AGENT ---

export const agentExecutor = createReactAgent({
    llm,
    tools: [searchTransactionsTool, checkAnomaliesTool, saveTransactionTool],
});

export async function processChat(userId: string, message: string) {
    console.log("processChat started for user:", userId);
    // 1. Save User Message to Milvus
    try {
        await upsertMessage(userId, 'user', message);
    } catch (e) {
        console.error("Failed to save user message to Milvus, continuing...", e);
    }

    // 2. Retrieve Context (Chat History + Relevant Transactions)
    console.log("Retrieving chat history...");
    const history = await searchChatHistory(userId, message, 5);
    console.log(`Found ${history.length} history items`);

    // Sort history by timestamp (Milvus returns by relevance, but for chat context we might want chronological order of relevant bits or just relevance)
    // Actually, for RAG, relevance is key. But for conversation flow, recent messages matter.
    // Let's just pass the relevant history as context in the system message or as previous messages.

    const contextMessages = history.map(h =>
        h.role === 'user' ? new HumanMessage(h.content) : new AIMessage(h.content)
    );

    // 3. Invoke Agent
    console.log("Invoking Agent...");
    try {
        const result = await agentExecutor.invoke({
            messages: [
                new SystemMessage("You are SmartKas, a helpful financial assistant. Use your tools to answer questions about transactions, check for anomalies, or save new transactions. Speak Indonesian."),
                ...contextMessages,
                new HumanMessage(message)
            ],
        });
        console.log("Agent finished execution");

        const lastMessage = result.messages[result.messages.length - 1];
        const reply = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);

        // 4. Save Assistant Reply to Milvus
        await upsertMessage(userId, 'assistant', reply);

        return reply;
    } catch (error) {
        console.error("Error invoking agent:", error);
        throw error;
    }
}
