type StoredMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

type MemoryRequest = {
	messages?: StoredMessage[];
};

export class MemoryDO {
	private state: DurableObjectState;
	private memory: StoredMessage[] = [];

	constructor(state: DurableObjectState) {
		this.state = state;

		this.state.blockConcurrencyWhile(async () => {
			const stored = await this.state.storage.get<StoredMessage[]>("memory");
			if (stored) {
				this.memory = stored;
			}
		});
	}

	async fetch(request: Request): Promise<Response> {
		// -------------------------------
		// READ MEMORY (GET)
		// -------------------------------
		if (request.method === "GET") {
			return new Response(
				JSON.stringify({ memory: this.memory }),
				{ headers: { "Content-Type": "application/json" } }
			);
		}

		// -------------------------------
		// WRITE MEMORY (POST)
		// -------------------------------
		if (request.method === "POST") {
			const body = (await request.json()) as MemoryRequest;

			if (body.messages && body.messages.length > 0) {
				this.memory.push(...body.messages);
				await this.state.storage.put("memory", this.memory);
			}

			return new Response(
				JSON.stringify({ ok: true }),
				{ headers: { "Content-Type": "application/json" } }
			);
		}

		return new Response("Method not allowed", { status: 405 });
	}
}
