import { MemoryDO } from "./memory";

type ChatMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

type ChatRequest = {
	messages?: ChatMessage[];
};

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type"
};

export default {
	async fetch(request: Request, env: any): Promise<Response> {
		// -------------------------------
		// CORS preflight
		// -------------------------------
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: corsHeaders
			});
		}

		if (request.method !== "POST") {
			return new Response("Send a POST request with messages", {
				status: 405,
				headers: corsHeaders
			});
		}

		const body = (await request.json()) as ChatRequest;

		const incomingMessages: ChatMessage[] =
			body.messages ?? [{ role: "user", content: "Hello! Who are you?" }];

		// -------------------------------
		// Durable Object Memory
		// -------------------------------
		const url = new URL(request.url);
		const userId = url.searchParams.get("user") ?? "default";

		const memoryId = env.MEMORY.idFromName(userId);
		const memoryStub = env.MEMORY.get(memoryId);

		// Read memory
		const memoryResponse = await memoryStub.fetch("https://memory");
		const { memory = [] } = await memoryResponse.json();

		// Persist new messages
		await memoryStub.fetch("https://memory", {
			method: "POST",
			body: JSON.stringify({ messages: incomingMessages })
		});

		// -------------------------------
		// Agent prompt construction
		// -------------------------------
		const systemMessage: ChatMessage = {
			role: "system",
			content:
				memory.length > 0
					? `You remember the following about the user:\n- ${memory
						.map((m: ChatMessage) => m.content)
						.join("\n- ")}`
					: "You have no prior memory about this user."
		};

		const plannedMessages: ChatMessage[] = [
			systemMessage,
			...incomingMessages
		];

		// -------------------------------
		// LLM Call
		// -------------------------------
		const response = await env.AI.run(
			"@cf/meta/llama-3-8b-instruct",
			{ messages: plannedMessages }
		);

		return new Response(JSON.stringify(response), {
			headers: {
				...corsHeaders,
				"Content-Type": "application/json"
			}
		});
	}
};

export { MemoryDO };
