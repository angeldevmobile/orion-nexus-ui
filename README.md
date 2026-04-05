# Orion Nexus Studio

AI-powered web IDE that turns natural language prompts into live React applications â€” built on Claude (Anthropic), Monaco Editor, WebContainers, and a browser-native virtual filesystem.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Security](#security)

---

## Overview

Orion Nexus Studio is a full-stack AI development platform. Describe what you want in plain language â€” get back a live Vite preview, editable code, and a complete file structure in seconds.

**Core capabilities:**
- Prompt â†’ React project â†’ live Vite preview powered by WebContainers
- SSE streaming: see the AI generating code token by token in real time
- Full Monaco Editor with syntax highlighting, tabs, and file explorer
- Browser-based project execution via WebContainer API
- Persistent virtual filesystem (IndexedDB-backed via LightningFS)
- GitHub OAuth + JWT authentication
- Auto-fix: Vite errors are automatically detected and sent back to the AI for correction
- Real-time collaborative presence via Socket.IO

---

## Tech Stack

### Frontend
| Category | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite + SWC |
| Styling | Tailwind CSS + shadcn/ui |
| Code Editor | Monaco Editor |
| State | Zustand + React Context |
| Routing | React Router 6 |
| Filesystem | @isomorphic-git/lightning-fs |
| Runtime | @webcontainer/api |
| Real-time | socket.io-client |

### Backend
| Category | Technology |
|---|---|
| Framework | Express + TypeScript |
| Database | PostgreSQL |
| Authentication | Passport.js + JWT |
| AI | Anthropic Claude (streaming) |
| Security | Helmet + bcryptjs + rate limiting |
| Real-time | Socket.IO |

---

## Project Structure

```
orion-nexus-studio/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ AIChat.tsx          â† Main AI builder UI
â”‚   â”‚   â”œâ”€â”€ Editor.tsx          â† Monaco editor + file explorer
â”‚   â”‚   â”œâ”€â”€ Auth.tsx            â† Login / Register / GitHub OAuth
â”‚   â”‚   â””â”€â”€ ...
â”‚   â”œâ”€â”€ service/
â”‚   â”‚   â”œâ”€â”€ AiService.ts        â† AI streaming client
â”‚   â”‚   â””â”€â”€ ApiService.tsx      â† HTTP client with JWT injection
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â””â”€â”€ useChat.ts          â† Zustand store
â”‚   â”œâ”€â”€ contexts/
â”‚   â”‚   â”œâ”€â”€ ChatContext.tsx
â”‚   â”‚   â”œâ”€â”€ ProjectContext.tsx
â”‚   â”‚   â””â”€â”€ AuthProvider.tsx
â”‚   â””â”€â”€ editor/
â”‚       â”œâ”€â”€ FileManager.ts
â”‚       â”œâ”€â”€ MonacoEditor.tsx
â”‚       â”œâ”€â”€ FileExplorer.tsx
â”‚       â””â”€â”€ runtime/
â”‚           â””â”€â”€ orionContainer.ts â† WebContainer lifecycle
â”‚
â””â”€â”€ orion-nexus-backend/src/
    â”œâ”€â”€ routes/
    â”œâ”€â”€ controllers/
    â”œâ”€â”€ services/
    â”œâ”€â”€ middleware/
    â””â”€â”€ config/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Anthropic API key
- Chromium-based browser (required for WebContainer API â€” Firefox not supported)

### Install

```bash
# Frontend
npm install

# Backend
cd orion-nexus-backend
npm install
```

### Configure

Copy the example env files and fill in your values:

```bash
cp .env.example .env
cp orion-nexus-backend/.env.example orion-nexus-backend/.env
```

See `.env.example` files for the required variables.

### Database

```bash
psql -U postgres -c "CREATE DATABASE \"orion-nexus\";"
# Schema auto-migrates on first server start
```

### Run

```bash
# Terminal 1 â€” Backend (port 5000)
cd orion-nexus-backend
npm run dev

# Terminal 2 â€” Frontend (port 8080)
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
| Authentication | JWT + bcrypt |
| Rate limiting | Per-route limiters |
| Input validation | express-validator |
| SQL injection | Parameterized queries |
| File uploads | Type + size restrictions |

**Never commit `.env` files.** All secrets must be set via environment variables only.

