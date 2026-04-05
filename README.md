# Orion Nexus Studio

AI-powered web IDE that turns natural language prompts into live React applications - built on Claude (Anthropic), Monaco Editor, WebContainers, and a browser-native virtual filesystem.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Security](#security)

---

## Overview

Orion Nexus Studio is a full-stack AI development platform. Describe what you want in plain language and get back a live Vite preview, editable code, and a complete file structure in seconds.

**Core capabilities:**
- Prompt -> React project -> live Vite preview powered by WebContainers
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
├── src/
│   ├── pages/
│   │   ├── AIChat.tsx          <- Main AI builder UI
│   │   ├── Editor.tsx          <- Monaco editor + file explorer
│   │   ├── Auth.tsx            <- Login / Register / GitHub OAuth
│   │   └── ...
│   ├── service/
│   │   ├── AiService.ts        <- AI streaming client
│   │   └── ApiService.tsx      <- HTTP client with JWT injection
│   ├── hooks/
│   │   └── useChat.ts          <- Zustand store
│   ├── contexts/
│   │   ├── ChatContext.tsx
│   │   ├── ProjectContext.tsx
│   │   └── AuthProvider.tsx
│   └── editor/
│       ├── FileManager.ts
│       ├── MonacoEditor.tsx
│       ├── FileExplorer.tsx
│       └── runtime/
│           └── orionContainer.ts <- WebContainer lifecycle
│
└── orion-nexus-backend/src/
    ├── routes/
    ├── controllers/
    ├── services/
    ├── middleware/
    └── config/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Anthropic API key
- Chromium-based browser (required for WebContainer API - Firefox not supported)

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
cd orion-nexus-backend
node migrate.js
```

### Run

```bash
# Backend (port 5000)
cd orion-nexus-backend
npm run dev

# Frontend (port 5173)
npm run dev
```

---

## Security

| Practice | Implementation |
|---|---|
| Authentication | JWT (short-lived) + HttpOnly cookies |
| Password storage | bcryptjs (salt rounds: 12) |
| Rate limiting | express-rate-limit per route |
| Input validation | express-validator on all endpoints |
| Headers | Helmet.js |
| CORS | Allowlist-based origin check |
| Secrets | Environment variables only - never committed |