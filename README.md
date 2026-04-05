# Orion Nexus Studio

AI-powered web IDE that turns natural language prompts into live React applications — built on Claude (Anthropic), Monaco Editor, WebContainers, and a browser-native virtual filesystem.

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

Orion Nexus Studio is a full-stack AI development platform. Describe what you want in plain Spanish — get back a live Vite preview, editable code, and a complete file structure in seconds.

**Core capabilities:**
- Prompt → React project → live Vite preview powered by WebContainers
- SSE streaming: see the AI generating code token by token in real time
- Full Monaco Editor with syntax highlighting, tabs, and file explorer
- Browser-based project execution via WebContainer API (same architecture as Lovable)
- Persistent virtual filesystem (IndexedDB-backed via LightningFS)
- GitHub OAuth + JWT authentication
- Auto-fix: Vite errors are automatically detected and sent back to the AI for correction

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
│    │    Buffer chunks → when __ENRICHED__:                     │  │
│    │      parse XML → { files[], reactCode, description }      │  │
│    │                                                           │  │
│    ├── Chat panel: design card (description)                   │  │
│    ├── Preview tab: WebContainer → Vite dev server → iframe    │  │
│    └── Code tab: reactCode in SyntaxHighlighter                │  │
│                                                                   │
│  WebContainer (shared between AIChat + Editor)                    │
│    ├── Boot → write files → npm install → vite dev              │  │
│    ├── HMR: subsequent AI generations hot-update files only      │  │
│    └── Auto-fix: Vite errors → AI correction → hot-update       │  │
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
│  streamResponse()                                                 │
│    ├── UI request detected → Claude (XML response)               │
│    │     parses XML → enriches with __ENRICHED__ SSE event       │
│    └── Conversational → Claude                                   │
│          returns: plain text                                      │
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
| AI | Anthropic Claude (streaming + XML responses) |
| Security | Helmet + bcryptjs + rate limiting |
| Real-time | Socket.IO |
| Email | Nodemailer |

---

## Project Structure

```
orion-nexus-studio/
├── src/
│   ├── pages/
│   │   ├── AIChat.tsx          ← Main AI builder UI (chat + Vite preview + code)
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
│   │   └── useChat.ts          ← Zustand store: messages, WC lifecycle, send
│   │
│   ├── contexts/
│   │   ├── ChatContextType.tsx ← ChatContext type definition
│   │   ├── ChatContext.tsx     ← ChatProvider (streaming + XML parsing)
│   │   ├── ProjectContext.tsx  ← Active file, filesystem events
│   │   └── AuthProvider.tsx
│   │
│   └── editor/
│       ├── FileManager.ts      ← Virtual FS abstraction
│       ├── MonacoEditor.tsx
│       ├── FileExplorer.tsx
│       ├── templates.ts        ← React, Next, Vue project templates
│       └── runtime/
│           └── orionContainer.ts ← WebContainer: boot, install, runDevServer, HMR
│
└── orion-nexus-backend/src/
    ├── routes/ai.ts            ← /chat, /chat/stream, /generate-*
    ├── services/
    │   ├── aiService.ts        ← streamResponse() + generateResponse()
    │   ├── uiGenerationService.ts ← XML parsing + file extraction
    │   └── conversationService.ts ← Chat history management
    └── ...
```

---

## Core Loop

This is the main flow — prompt to live Vite preview:

```
1. User types: "Crea un dashboard con gráficas de ventas"
   │
2. useChat.sendMessage(prompt)
   ├── Adds user message to local state
   ├── Injects existing project files as context (if any)
   └── Calls AiService.streamMessage(prompt, history)
   │
3. AiService → POST /api/ai/chat/stream (SSE)
   │   Body: { message, chatHistory, context }
   │
4. Backend: Claude receives prompt + XML system prompt
   │   Streams XML response token by token
   │   Each token → SSE event: data: {"chunk":"..."}
   │
5. Frontend buffers chunks in real time
   │   GenerationProgress UI shows elapsed time + steps
   │
6. Stream hits __ENRICHED__ sentinel:
   │   {
   │     files: [{ path, content }, ...],   ← all project files
   │     reactCode: "function App() {...}",  ← App.tsx content
   │     description: "Dashboard con...",    ← shown in chat
   │   }
   │
7. Frontend:
   ├── Writes all files to LightningFS (virtual filesystem)
   ├── Chat panel: shows description card
   ├── Code tab: shows reactCode in SyntaxHighlighter
   └── Boots WebContainer (or hot-updates if already running):
         boot → npm install → vite dev → iframe preview URL
   │
8. WebContainer ready → previewUrl set → Vite iframe fades in
   └── HMR active: next AI generation updates files without restart
```

---

## AI Response Pipeline

### UI Generation (Claude — XML mode)

When the user asks for an interface, Claude responds in structured XML:

```xml
<project>
  <type>ui_component</type>
  <description>Dashboard de ventas con gráficas y métricas</description>
  <designInfo>
    <colors primary="#06B6D4" secondary="#8B5CF6" background="#0F0F1A"/>
    <effects>Gradients,Glassmorphism,Hover animations</effects>
    <layout>Grid/Flexbox moderno</layout>
    <components>Navbar,Card,Chart,Button</components>
  </designInfo>
  <files>
    <file path="package.json"><![CDATA[...]]></file>
    <file path="index.html"><![CDATA[...]]></file>
    <file path="src/main.tsx"><![CDATA[...]]></file>
    <file path="src/App.tsx"><![CDATA[...]]></file>
    <file path="src/components/Dashboard.tsx"><![CDATA[...]]></file>
  </files>
</project>
```

The backend parses this XML and emits a `__ENRICHED__` SSE event with the extracted files. The frontend writes them to the virtual FS and boots WebContainer — no CDN, no bundler workarounds, just real Vite.

**`files[]`**: Complete multi-file project — all components in separate files, saved to LightningFS and loaded in the Monaco editor.
**`reactCode`**: App.tsx content — shown in the Code tab with syntax highlighting.

### Conversational Response (Claude)

For non-UI questions, Claude returns plain text (markdown). Displayed directly in the chat panel with `react-markdown`.

---

## Streaming Architecture

### Backend SSE endpoint

```
POST /api/ai/chat/stream
Body: { message, chatHistory, context }

Response: text/event-stream
  data: {"chunk":"<project>"}
  data: {"chunk":"<type>ui_component</type>"}
  ...
  data: {"type":"__ENRICHED__","data":{"files":[...],"reactCode":"...","description":"..."}}
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
    const parsed = JSON.parse(payload);
    if (parsed.type === '__ENRICHED__') {
      onEnriched(parsed.data);  // triggers WebContainer boot
    } else {
      onChunk(parsed.chunk);    // updates streaming text in real time
    }
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

After AI generates `files[]`, each file is written to both LightningFS and the WebContainer:
```typescript
// 1. Write to virtual FS (Monaco editor reads from here)
for (const file of enriched.files) {
  await fileManager.writeFile(file.path, file.content);
}

// 2. Boot WebContainer (or hot-update if Vite is already running)
await bootWebContainer(enriched.files);
```

The Monaco editor and the WebContainer stay in sync — both read/write from LightningFS.

---

## State Management

### useChat (Zustand — `src/hooks/useChat.ts`)

Primary store for the AI builder page:

```typescript
{
  messages: Message[]           // full conversation
  sending: boolean              // request in flight
  streamingContent: string      // live SSE buffer (shown during generation)
  generatedCode: string         // App.tsx content from last AI response
  previewUrl: string            // Vite dev server URL (served by WebContainer)
  wcStatus: WcStatus            // 'idle' | 'booting' | 'installing' | 'starting' | 'ready' | 'error'
  wcLogs: string[]              // WebContainer terminal output
  wcError: string               // last Vite error (triggers auto-fix)
  uiData: UIComponentData | null // full parsed AI response

  sendMessage(prompt, context?)  // triggers SSE stream + WC boot
  sendFullProjectRequest(prompt) // generates complete multi-file project
  autoFixError(error)            // sends Vite error to AI for automatic correction
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

# AI
ANTHROPIC_API_KEY=sk-ant-api03-...

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
- Anthropic API key
- Chromium-based browser (required for WebContainer API — Firefox not supported)

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

> **Note:** WebContainers require cross-origin isolation headers (`COOP` + `COEP`). These are configured automatically by the Vite dev server.

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
