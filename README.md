# Orion Nexus Studio

AI-powered web IDE that turns natural language prompts into live React applications — built on Claude, GPT-4o, Monaco Editor, and a browser-native virtual filesystem.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Loop — How It Works](#core-loop)
- [AI Response Pipeline](#ai-response-pipeline)
- [Streaming Architecture](#streaming-architecture)
- [Virtual Filesystem](#virtual-filesystem)
- [State Management](#state-management)
- [Backend API Reference](#backend-api-reference)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Security](#security)

---

## Overview

Orion Nexus Studio is a full-stack AI development platform. Describe what you want in plain Spanish — get back a live preview, editable code, and a complete file structure in seconds.

**Core capabilities:**
- Prompt → React component → live preview in one click
- SSE streaming: see the AI generating code token by token in real time
- Full Monaco Editor with syntax highlighting, tabs, and file explorer
- Browser-based project execution via WebContainer API
- Persistent virtual filesystem (IndexedDB-backed via LightningFS)
- GitHub OAuth + JWT authentication

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Frontend)                        │
│                                                                   │
│  AIChat.tsx ──────────────────────────────────────────────────┐  │
│    │  User types prompt                                        │  │
│    │  useChat (Zustand) ──► AiService.streamMessage()         │  │
│    │                              │                            │  │
│    │        SSE stream (token by token)                        │  │
│    │              │                                            │  │
│    │    Buffer chunks → when [DONE]:                           │  │
│    │      parse JSON → { type, files, previewHtml, reactCode } │  │
│    │                                                           │  │
│    ├── Chat panel: show design card (colors, effects, layout)  │  │
│    ├── Preview tab: previewHtml in iframe                      │  │
│    └── Code tab: reactCode in SyntaxHighlighter                │  │
│                                                                   │
│  Editor.tsx                                                       │
│    FileExplorer ─► FileManager (LightningFS) ─► MonacoEditor     │
│    WebContainer ─► npm install + vite dev ─► iframe preview      │
└──────────────────────────────────┬──────────────────────────────┘
                                   │  HTTP REST + SSE
┌──────────────────────────────────▼──────────────────────────────┐
│                  Backend (Express / Node.js)                      │
│                                                                   │
│  POST /api/ai/chat         → stateless chat (JSON response)      │
│  POST /api/ai/chat/stream  → SSE streaming (token by token)      │
│  POST /api/ai/generate-full-project → multi-file project         │
│                                                                   │
│  aiService.generateResponse()                                     │
│    ├── UI request detected → GPT-4o (JSON mode)                  │
│    │     returns: { type, files, reactCode, previewHtml, ... }   │
│    └── Conversational → Claude 3 Haiku                           │
│          returns: plain text                                      │
│                                                                   │
│  aiService.streamResponse()                                       │
│    ├── UI request → GPT-4o streaming → SSE chunks                │
│    └── Chat → Claude streaming → SSE chunks                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Category | Technology |
|---|---|
| Framework | React 18.3 + TypeScript |
| Build | Vite 5.4 + SWC |
| Styling | Tailwind CSS 3.4 + shadcn/ui |
| Code Editor | Monaco Editor 4.7 |
| State | Zustand 5 + React Context |
| Routing | React Router 6.30 |
| Filesystem | @isomorphic-git/lightning-fs + memfs |
| Runtime | @webcontainer/api |
| Syntax highlighting | react-syntax-highlighter |
| Markdown | react-markdown |

### Backend
| Category | Technology |
|---|---|
| Framework | Express 5 + TypeScript |
| Database | PostgreSQL |
| Authentication | Passport.js + JWT |
| AI (UI generation) | OpenAI GPT-4o (JSON mode + streaming) |
| AI (chat) | Anthropic Claude 3 Haiku (streaming) |
| Security | Helmet + bcryptjs + rate limiting |
| Real-time | Socket.IO |
| Email | Nodemailer |

---

## Project Structure

```
orion-nexus-studio/
├── src/
│   ├── pages/
│   │   ├── AIChat.tsx          ← Main AI builder UI (chat + preview + code)
│   │   ├── Editor.tsx          ← Monaco editor + file explorer + WebContainer
│   │   ├── Auth.tsx            ← Login / Register / GitHub OAuth
│   │   ├── Dashboard.tsx
│   │   └── ...
│   │
│   ├── service/
│   │   ├── AiService.ts        ← sendMessage() + streamMessage()
│   │   └── ApiService.tsx      ← HTTP client with JWT injection
│   │
│   ├── hooks/
│   │   └── useChat.ts          ← Zustand store: messages, streaming state, send
│   │
│   ├── contexts/
│   │   ├── ChatContextType.tsx ← ChatContext type definition
│   │   ├── ChatContext.tsx     ← ChatProvider (streaming + JSON parsing)
│   │   ├── ProjectContext.tsx  ← Active file, filesystem events
│   │   └── AuthProvider.tsx
│   │
│   └── editor/
│       ├── FileManager.ts      ← Virtual FS abstraction
│       ├── MonacoEditor.tsx
│       ├── FileExplorer.tsx
│       ├── templates.ts        ← React, Next, Vue project templates
│       └── runtime/
│           └── orionContainer.ts ← WebContainer integration
│
└── orion-nexus-backend/src/
    ├── routes/ai.ts            ← /chat, /chat/stream, /generate-*
    ├── services/aiService.ts   ← generateResponse() + streamResponse()
    └── ...
```

---

## Core Loop

This is the main flow — prompt to live preview:

```
1. User types: "Crea un dashboard con gráficas de ventas"
   │
2. useChat.sendMessage(prompt)
   ├── Adds user message to local state
   ├── Calls AiService.streamMessage(prompt, history)
   │
3. AiService → POST /api/ai/chat/stream (SSE)
   │   Body: { message, chatHistory, context }
   │
4. Backend detects: "dashboard" → UI generation path
   │   GPT-4o with JSON system prompt → streaming response
   │   Each token → SSE event: data: {"chunk":"..."}
   │
5. Frontend receives chunks → buffers full response
   │   Shows streaming text in code tab (real-time typing effect)
   │
6. Stream ends → data: [DONE]
   │   JSON.parse(fullResponse) →
   │   {
   │     type: "ui_component",
   │     reactCode: "export default function Dashboard() {...}",
   │     previewHtml: "<!DOCTYPE html>...",   ← complete HTML with Tailwind CDN
   │     designInfo: { colors, effects, layout, components },
   │     files: [{ path, content }, ...]
   │   }
   │
7. UI updates:
   ├── Chat panel: design card (palette, effects, layout, components)
   ├── Preview tab: <iframe srcDoc={previewHtml} />
   └── Code tab: <SyntaxHighlighter>{reactCode}</SyntaxHighlighter>
   │
8. fileManager.writeFile("/src/App.tsx", reactCode)
   └── Toast: "Código guardado → Abrir en Editor"
```

---

## AI Response Pipeline

### UI Component Response (GPT-4o)

When the user asks for an interface (login, dashboard, form, etc.), GPT-4o returns structured JSON:

```json
{
  "type": "ui_component",
  "designInfo": {
    "colors": { "primary": "#06B6D4", "background": "#0F172A" },
    "effects": ["glassmorphism", "gradient borders", "hover animations"],
    "layout": "centered card with flexbox",
    "components": ["Card", "Button", "Input", "Badge"]
  },
  "files": [
    { "path": "src/App.tsx", "content": "..." },
    { "path": "src/components/Dashboard.tsx", "content": "..." }
  ],
  "reactCode": "export default function Dashboard() { ... }",
  "previewHtml": "<!DOCTYPE html><html>...<script src='cdn/tailwind'></script>...</html>",
  "timestamp": "2026-03-29T..."
}
```

**`reactCode`**: The primary component (App.tsx), ready for the editor.
**`previewHtml`**: Complete self-contained HTML with Tailwind CDN — displayed in `<iframe srcDoc>`, no bundler needed.
**`files[]`**: All components split into separate files — saved to the virtual filesystem for the Monaco editor.

### Conversational Response (Claude)

For non-UI questions, Claude 3 Haiku returns plain text (markdown). Displayed directly in the chat panel with `react-markdown`.

---

## Streaming Architecture

### Backend SSE endpoint

```
POST /api/ai/chat/stream
Body: { message, chatHistory, context }

Response: text/event-stream
  data: {"chunk":"export"}
  data: {"chunk":" default"}
  data: {"chunk":" function"}
  ...
  data: [DONE]
```

### Frontend SSE consumer (AiService.streamMessage)

```typescript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6).trim();
    if (payload === '[DONE]') return;
    const { chunk } = JSON.parse(payload);
    onChunk(chunk);  // updates streaming state in real time
  }
}
```

### Fallback

If the streaming endpoint fails, `useChat` automatically retries with the non-streaming `/api/ai/chat` endpoint.

---

## Virtual Filesystem

```
FileManager (src/editor/FileManager.ts)
  ├── readFile(path)             → Promise<string>
  ├── writeFile(path, content)   → Promise<void>
  ├── createFile(path)           → Promise<void>
  ├── createFolder(path)         → Promise<void>
  ├── listDir(path)              → Promise<DirEntry[]>
  ├── deleteFile(path)           → Promise<void>
  └── fileExists(path)           → Promise<boolean>

Adapters:
  LightningFS  → IndexedDB, persists across sessions (default)
  memfs        → in-memory, ephemeral, fast
```

After AI generates `files[]`, each file is written to the virtual FS:
```typescript
for (const file of parsed.files) {
  await fileManager.writeFile(file.path, file.content);
}
```
The Monaco editor then reads from the same FS — giving a consistent view.

---

## State Management

### useChat (Zustand — `src/hooks/useChat.ts`)

Primary store for the AI builder page:

```typescript
{
  messages: Message[]           // full conversation
  sending: boolean              // request in flight
  streamingContent: string      // live SSE buffer (shown in code tab)
  generatedCode: string         // reactCode from last AI response
  previewHtml: string           // previewHtml for iframe
  uiData: UIComponentData | null // full parsed JSON

  sendMessage(prompt, context?)  // triggers SSE stream + fallback
  clearChat()
}
```

### ChatContext (React Context — `src/contexts/ChatContext.tsx`)

Thin wrapper over the Zustand store, used for components that need context injection (not the main AIChat page).

### ProjectContext

```typescript
{
  files: ProjectFile[]
  activeFile: string
  generatedPreview: string
  updateFileContent(name, content)
  setGeneratedPreview(code)
}
```

---

## Backend API Reference

### AI Generation (`/api/ai`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/chat` | No (dev) | Stateless chat — returns full JSON response |
| POST | `/chat/stream` | No (dev) | Stateless chat with SSE streaming |
| POST | `/generate-code` | No (dev) | Generate code from prompt |
| POST | `/generate-full-project` | No (dev) | Multi-file project (returns `files` map) |
| POST | `/generate-component` | No (dev) | Single React component |
| POST | `/explain` | No (dev) | Explain code |
| POST | `/optimize` | No (dev) | Suggest optimizations |
| POST | `/review` | No (dev) | Code review |

> Auth is optional in development (`NODE_ENV !== 'production'`). In production all endpoints require JWT.

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | Email + password → JWT |
| POST | `/register` | Create account → JWT |
| GET | `/github` | Initiate GitHub OAuth |
| GET | `/github/callback` | GitHub OAuth callback |
| GET | `/profile` | Get current user (JWT) |
| PUT | `/profile` | Update profile (JWT) |

---

## Database Schema

### `users`
```sql
id         SERIAL PRIMARY KEY
email      VARCHAR UNIQUE NOT NULL
password   VARCHAR                  -- bcrypt, NULL for OAuth
username   VARCHAR
avatar     VARCHAR
github_id  VARCHAR UNIQUE
role       VARCHAR DEFAULT 'user'
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

### `chat_sessions`
```sql
id         SERIAL PRIMARY KEY
user_id    INTEGER REFERENCES users(id)
title      VARCHAR
messages   JSONB   -- [{ role, content, timestamp }, ...]
context    JSONB   -- { projectId, fileContext, codeContext }
is_active  BOOLEAN DEFAULT TRUE
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

### `projects`
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER REFERENCES users(id)
name        VARCHAR NOT NULL
description TEXT
files       JSONB
is_public   BOOLEAN DEFAULT FALSE
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP DEFAULT NOW()
```

---

## Environment Variables

### Frontend (`/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`/orion-nexus-backend/.env`)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8080

# PostgreSQL
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=orion-nexus
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# AI Models
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL_MAIN=gpt-4o
OPENAI_MODEL_FAST=gpt-4o-mini
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL_MAIN=claude-3-5-sonnet-20241022
CLAUDE_MODEL_FAST=claude-3-haiku-20240307

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- OpenAI API key (for UI generation)
- Anthropic API key (for conversational chat)

### Install

```bash
# Frontend
npm install

# Backend
cd orion-nexus-backend
npm install
```

### Configure

Create `.env` in the root and `orion-nexus-backend/.env` using the templates above.

### Database

```bash
psql -U postgres -c "CREATE DATABASE \"orion-nexus\";"
# Schema auto-migrates on first server start
```

### Run

```bash
# Terminal 1 — Backend (port 5000)
cd orion-nexus-backend
npm run dev

# Terminal 2 — Frontend (port 8080)
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

---

## Security

| Layer | Mechanism |
|---|---|
| HTTP Headers | Helmet.js |
| CORS | Explicit origin whitelist |
| Authentication | JWT + refresh tokens |
| Password storage | bcrypt 12 rounds |
| Rate limiting | 100 req / 15 min |
| Input validation | express-validator |
| SQL injection | Parameterized queries (pg) |
| File uploads | Multer with type + size limits |

**Never commit `.env` files.**

---

## Roadmap

- [ ] Persistent chat sessions (PostgreSQL storage for history)
- [ ] Deploy to cloud (Vercel, Netlify, Railway) from the IDE
- [ ] Git integration (commit, branch, push) within the editor
- [ ] Component marketplace
- [ ] Real-time multi-user collaboration with cursor presence
- [ ] Fine-tuning on user codebases
