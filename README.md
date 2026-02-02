# 🌩️ Cloudflare AI Agent (Stateful, Edge-Native)

A stateful AI agent built on the **Cloudflare Developer Platform**, demonstrating how to run large language models at the edge with persistent memory and a simple web-based chat interface.

This project showcases how Cloudflare Workers, Workers AI, Durable Objects, and Pages can be combined to build an end-to-end AI agent without managing servers.

---

## ✨ Features

- 🤖 **LLM at the Edge** using Cloudflare Workers AI (Llama)
- 🧠 **Persistent per-user memory** via Durable Objects
- 🌐 **Web-based chat UI** powered by Cloudflare Pages
- ⚡ **Low-latency serverless execution**
- 🔐 Stateless HTTP requests with stateful agent behavior
- 🧩 Clean separation of UI, memory, and reasoning logic
- 🌍 **Browser-ready**: Worker includes CORS + OPTIONS preflight handling for Pages → Worker calls

---

## 🏗️ Architecture Overview

```
Browser (Cloudflare Pages)
        │
        ▼
Cloudflare Worker (Agent API / Orchestration)
        │
        ├── Durable Object (Per-user Memory)
        │
        └── Workers AI (LLM inference)
```

### How it works (high level)
1. Pages UI sends a user message to the Worker: `POST /?user=<id>`
2. Worker reads conversation memory from the Durable Object for that user
3. Worker injects memory into a `system` message and calls Workers AI
4. Worker returns `{ response, usage }` to the browser
5. Worker persists the new message back into Durable Object memory

---

## 🗂️ Project Structure

```
cloudflare-ai-agent/
├── apps/
│   ├── worker/                 # Cloudflare Worker (agent + memory)
│   │   ├── src/
│   │   │   ├── index.ts        # Worker entrypoint (CORS + agent logic + Workers AI)
│   │   │   └── memory.ts       # Durable Object: per-user memory store
│   │   └── wrangler.jsonc
│   │
│   └── web/                    # Cloudflare Pages frontend (static)
│       ├── public/
│       │   └── index.html      # Chat UI
│       └── wrangler.jsonc
```

---

## 🧠 Memory Design

- Each request includes a `?user=<id>` query parameter.
- The Worker uses that id to route to a **Durable Object instance** (one per user).
- Memory is stored persistently inside Durable Object storage.
- On each chat request:
    - Memory is **read**
    - Converted into a **system prompt**
    - Injected into the LLM call
    - New user messages are **appended** to memory

This enables **stateful behavior** on top of stateless HTTP requests.

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Cloudflare account (logged in with Wrangler)
- Wrangler CLI

Install Wrangler (if needed):
```bash
npm install -g wrangler
```

---

### 1) Run the Worker (AI + Memory)
```bash
cd apps/worker
wrangler dev
```

Expected:
- Worker running at `http://localhost:8787`

---

### 2) Run the Pages UI
```bash
cd apps/web
npm install
npm run dev
```

Expected:
- Pages dev server running at a local URL (example: `http://localhost:8791`)

---

## 🧪 Test (UI)

Open the Pages URL, then try:
1. `My name is Bhumika`
2. `What is my name?`

The agent should respond using stored memory.

---

## 🧪 Test (cURL)

Set a user id:
```bash
curl -X POST "http://localhost:8787?user=bhumika" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "My name is Bhumika." }
    ]
  }'
```

Then ask:
```bash
curl -X POST "http://localhost:8787?user=bhumika" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "What is my name?" }
    ]
  }'
```

---

## 🌍 CORS & Browser Support

Because the Pages UI and Worker run on different origins in development, the Worker:
- Responds to `OPTIONS` requests (preflight)
- Adds `Access-Control-Allow-Origin` and related headers

This allows browser `fetch()` calls from Pages → Worker to succeed.

---

## 🔮 Possible Extensions

- Streaming responses (SSE / Realtime)
- Voice input using Web Speech API
- Tool calling (R2, KV, external APIs)
- Authenticated user sessions
- Summarization or “long-term memory” policies (keep only key facts)

---

## 🧰 Technologies Used

- Cloudflare Workers
- Cloudflare Workers AI
- Cloudflare Durable Objects
- Cloudflare Pages
- TypeScript (Worker)
- HTML/CSS/JS (UI)

---

## 🎯 Project Motivation

Built to explore Cloudflare’s **edge-native AI** stack and demonstrate a practical approach for creating a stateful AI agent using Workers AI + Durable Objects + Pages.

Concepts align with:
- https://developers.cloudflare.com/agents/

---

## 👩‍💻 Author

**Bhumika Pandey**  
MS in Computer Science  
Aspiring Software Engineer (Cloud & AI)

---

## ✅ Status

✔️ Fully functional  
✔️ End-to-end demo (Pages UI → Worker → Durable Object → Workers AI)  
✔️ Ready for review / internship submission
