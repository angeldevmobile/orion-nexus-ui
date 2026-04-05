import { create } from 'zustand';
import { aiService, ChatMessage, UIComponentData, EnrichedPayload } from '@/service/AiService';
import { fileManager } from '@/editor/FileManager';
import { initWebContainer, installDependencies, runDevServer, updateFilesInContainer, installPackage } from '@/editor/runtime/orionContainer';
import { findComponentsByPrompt } from '@/data/componentsLibrary';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  uiData?: UIComponentData;
}

export type WcStatus = 'idle' | 'booting' | 'installing' | 'starting' | 'ready' | 'error';

interface ChatStore {
  messages: Message[];
  sending: boolean;
  streamingContent: string;
  generatingFiles: string[];
  generatedCode: string;
  previewHtml: string;
  previewUrl: string;
  wcStatus: WcStatus;
  wcLogs: string[];
  wcError: string;
  uiData: UIComponentData | null;

  sendMessage: (prompt: string, fileContext?: string) => Promise<void>;
  sendFullProjectRequest: (prompt: string, framework?: string) => Promise<void>;
  autoFixError: (error: string) => Promise<void>;
  clearChat: () => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function addWcLog(msg: string) {
  useChatStore.setState(s => ({ wcLogs: [...s.wcLogs.slice(-49), msg] }));
}

// Debounce: ignore repeated errors within 5s to avoid spamming AI
let lastErrorHandled = 0;

async function handleViteError(error: string) {
  const now = Date.now();
  if (now - lastErrorHandled < 5000) return;
  lastErrorHandled = now;

  useChatStore.setState({ wcError: error });

  // ── Case 1: Missing npm package → auto-install, no AI needed ────────────
  const missingPkg = error.match(/Failed to resolve import ["']([^"'./@][^"']*?)["']/);
  if (missingPkg) {
    const pkg = missingPkg[1].split('/')[0]; // handle scoped: @scope/pkg → @scope/pkg
    addWcLog(`🔍 Paquete faltante detectado: ${pkg}`);
    try {
      await installPackage(pkg, addWcLog);
      useChatStore.setState({ wcError: '' });
      addWcLog('🔄 Vite recargando con el nuevo paquete...');
    } catch (e) {
      addWcLog(`❌ No se pudo instalar ${pkg}: ${e instanceof Error ? e.message : String(e)}`);
    }
    return;
  }

  // ── Case 2: Code error → send to AI for automatic fix ──────────────────
  const state = useChatStore.getState();
  if (state.sending) return; // already working

  const currentFiles = state.uiData?.files ?? [];
  const fileContext = currentFiles
    .filter(f => f.path.endsWith('.tsx') || f.path.endsWith('.ts'))
    .map(f => `// ${f.path}\n${f.content}`)
    .join('\n\n---\n\n')
    .slice(0, 4000); // token limit

  addWcLog('🤖 Error detectado — enviando al AI para corrección automática...');

  await useChatStore.getState().autoFixError(
    `Corrige este error de Vite automáticamente:\n\`\`\`\n${error}\n\`\`\`\n\nArchivos actuales:\n${fileContext}`
  );
}

async function writeFilesToVirtualFS(files: { path: string; content: string }[]) {
  await fileManager.clearDirectory('/').catch(() => {});
  for (const file of files) {
    const p = file.path.startsWith('/') ? file.path : `/${file.path}`;
    const dir = p.split('/').slice(0, -1).join('/');
    if (dir && dir !== '/') await fileManager.createFolder(dir).catch(() => {});
    await fileManager.writeFile(p, file.content).catch(console.error);
  }
  // Mark that the virtual FS was freshly populated in this browser session
  sessionStorage.setItem('orion:fs:fresh', 'true');
}

// ── Default config files injected when AI doesn't generate them ──────────────

const DEFAULT_PACKAGE_JSON = JSON.stringify({
  name: 'orion-project',
  version: '1.0.0',
  type: 'module',
  scripts: { dev: 'vite --host', build: 'vite build', preview: 'vite preview' },
  dependencies: {
    react: '^18.3.1',
    'react-dom': '^18.3.1',
    'react-router-dom': '^6.26.0',
    'clsx': '^2.1.1',
    'tailwind-merge': '^2.5.2',
    'lucide-react': '^0.462.0',
    'class-variance-authority': '^0.7.0',
  },
  devDependencies: {
    '@types/react': '^18.3.3',
    '@types/react-dom': '^18.3.0',
    '@vitejs/plugin-react-swc': '^3.5.0',
    tailwindcss: '^3.4.0',
    postcss: '^8.4.0',
    autoprefixer: '^10.4.0',
    typescript: '^5.5.3',
    vite: '^5.4.1',
  },
}, null, 2);

const DEFAULT_VITE_CONFIG = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
export default defineConfig({ plugins: [react()] });
`;

const DEFAULT_TSCONFIG = JSON.stringify({
  compilerOptions: {
    target: 'ES2020', lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    module: 'ESNext', skipLibCheck: true, moduleResolution: 'bundler',
    allowImportingTsExtensions: true, resolveJsonModule: true,
    isolatedModules: true, noEmit: true, jsx: 'react-jsx', strict: false,
  },
  include: ['src'],
}, null, 2);

const DEFAULT_TSCONFIG_NODE = JSON.stringify({
  compilerOptions: {
    composite: true, skipLibCheck: true,
    module: 'ESNext', moduleResolution: 'bundler', allowSyntheticDefaultImports: true,
  },
  include: ['vite.config.ts'],
}, null, 2);

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Orion App</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;

const DEFAULT_MAIN_TSX = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);`;

const DEFAULT_INDEX_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
`;

const DEFAULT_TAILWIND_CONFIG = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};`;

const DEFAULT_POSTCSS_CONFIG = `export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};`;

const DEFAULT_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#6366f1"/>
  <path d="M8 16 L16 8 L24 16 L16 24 Z" fill="white" opacity="0.9"/>
</svg>`;

function hasFile(files: { path: string }[], ...patterns: string[]): boolean {
  return files.some(f => patterns.some(p => f.path.includes(p)));
}

function augmentFilesForWC(files: { path: string; content: string }[]): { path: string; content: string }[] {
  const out = [...files];
  if (!hasFile(out, 'package.json')) out.push({ path: 'package.json', content: DEFAULT_PACKAGE_JSON });
  if (!hasFile(out, 'vite.config')) out.push({ path: 'vite.config.ts', content: DEFAULT_VITE_CONFIG });
  if (!hasFile(out, 'tsconfig.json')) {
    out.push({ path: 'tsconfig.json', content: DEFAULT_TSCONFIG });
    out.push({ path: 'tsconfig.node.json', content: DEFAULT_TSCONFIG_NODE });
  }
  if (!hasFile(out, 'index.html')) out.push({ path: 'index.html', content: DEFAULT_INDEX_HTML });
  if (!hasFile(out, 'main.tsx', 'main.ts')) out.push({ path: 'src/main.tsx', content: DEFAULT_MAIN_TSX });
  if (!hasFile(out, 'index.css')) {
    out.push({ path: 'src/index.css', content: DEFAULT_INDEX_CSS });
  }
  if (!hasFile(out, 'tailwind.config')) out.push({ path: 'tailwind.config.js', content: DEFAULT_TAILWIND_CONFIG });
  if (!hasFile(out, 'postcss.config')) out.push({ path: 'postcss.config.js', content: DEFAULT_POSTCSS_CONFIG });
  if (!hasFile(out, 'favicon')) out.push({ path: 'public/favicon.svg', content: DEFAULT_FAVICON_SVG });
  return out;
}

async function bootWebContainer(files: { path: string; content: string }[]) {
  const currentStatus = useChatStore.getState().wcStatus;

  // ── If Vite is already running → hot-update files only, no restart ──────────
  if (currentStatus === 'ready') {
    try {
      addWcLog('🔄 Actualizando archivos en WebContainer...');
      const snapshot: Record<string, string> = {};
      for (const f of files) {
        // Only update source files — skip package.json, vite.config, tsconfig
        const p = f.path.startsWith('/') ? f.path : `/${f.path}`;
        if (
          p.includes('/src/') ||
          p.endsWith('.tsx') || p.endsWith('.jsx') ||
          p.endsWith('.ts') || p.endsWith('.css')
        ) {
          snapshot[p] = f.content;
        }
      }
      await updateFilesInContainer(snapshot);
      addWcLog(`✅ ${Object.keys(snapshot).length} archivos actualizados — Vite HMR activo`);
    } catch (err) {
      addWcLog(`⚠️ Error actualizando archivos: ${err instanceof Error ? err.message : String(err)}`);
    }
    return;
  }

  // ── Cold boot ─────────────────────────────────────────────────────────────
  try {
    useChatStore.setState({ wcStatus: 'booting', wcLogs: [] });
    addWcLog('🚀 Iniciando WebContainer...');

    const augmented = augmentFilesForWC(files);
    const fsSnapshot: Record<string, string> = {};
    for (const f of augmented) {
      const p = f.path.startsWith('/') ? f.path : `/${f.path}`;
      fsSnapshot[p] = f.content;
    }

    await initWebContainer(fsSnapshot);
    addWcLog(`📦 ${augmented.length} archivos montados en WebContainer`);

    useChatStore.setState({ wcStatus: 'installing' });
    await installDependencies(addWcLog);

    useChatStore.setState({ wcStatus: 'starting' });
    addWcLog('⚡ Iniciando servidor Vite...');

    const url = await runDevServer(addWcLog, handleViteError);

    useChatStore.setState({ wcStatus: 'ready', previewUrl: url, wcError: '' });
    addWcLog(`✅ Vite corriendo en ${url}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    useChatStore.setState({ wcStatus: 'error' });
    addWcLog(`❌ ${msg}`);
  }
}

// ── store ─────────────────────────────────────────────────────────────────────

export const useChat = create<ChatStore>((set, get) => ({
  messages: [],
  sending: false,
  streamingContent: '',
  generatingFiles: [],
  generatedCode: '',
  previewHtml: '',
  previewUrl: '',
  wcStatus: 'idle',
  wcLogs: [],
  wcError: '',
  uiData: null,

  sendMessage: async (prompt: string, fileContext?: string) => {
    if (!prompt.trim()) return;

    const userMsg: Message = { role: 'user', content: prompt, timestamp: new Date() };
    set(state => ({
      messages: [...state.messages, userMsg],
      sending: true,
      streamingContent: '',
      generatingFiles: [],
      // Do NOT reset wcStatus/previewUrl — if the WebContainer is already running,
      // bootWebContainer will hot-update files instead of doing a full cold boot.
    }));

    const priorMessages = get().messages.slice(0, -1);
    const chatHistory: ChatMessage[] = priorMessages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    }));

    // ── Component library injection ──────────────────────────────────────────
    // If the user mentions a library component by name/tag, pre-write it to the
    // virtual FS and inject its code as additional context so the AI uses it.
    const matchedComponents = findComponentsByPrompt(prompt);
    let componentContext = '';
    if (matchedComponents.length > 0) {
      for (const comp of matchedComponents) {
        const path = `/src/components/${comp.fileName}`;
        const dir = path.split('/').slice(0, -1).join('/');
        if (dir && dir !== '/') await fileManager.createFolder(dir).catch(() => {});
        await fileManager.writeFile(path, comp.code).catch(() => {});
      }
      sessionStorage.setItem('orion:fs:fresh', 'true');
      componentContext = `\n\n[Componentes de la biblioteca ya disponibles en el proyecto]\n${matchedComponents
        .map(c => `// ${c.fileName}\n${c.code}`)
        .join('\n\n')}`;
    }

    // If there's an existing generated project, pass its source files as context
    // so Claude updates the existing code instead of starting from scratch.
    const currentUiData = get().uiData;
    let existingFilesContext = '';
    if (currentUiData?.files && currentUiData.files.length > 0) {
      const allSource = currentUiData.files
        .filter(f => f.path.endsWith('.tsx') || f.path.endsWith('.ts') || f.path.endsWith('.css'));

      // Prioritize structural files so the AI always sees the router and main entry points
      const PRIORITY = ['App.tsx', 'App.ts', 'main.tsx', 'router', 'routes', 'index.tsx'];
      const sorted = [
        ...allSource.filter(f => PRIORITY.some(p => f.path.includes(p))),
        ...allSource.filter(f => !PRIORITY.some(p => f.path.includes(p))),
      ];

      if (sorted.length > 0) {
        // Include complete files until budget — always cut on file boundaries, never mid-file
        let budget = 12000;
        const includedFiles: string[] = [];
        for (const f of sorted) {
          const entry = `// FILE: ${f.path}\n${f.content}`;
          // Always include the first file (App/router) even if large; skip rest if over budget
          if (includedFiles.length > 0 && entry.length > budget) break;
          includedFiles.push(entry);
          budget -= entry.length;
        }
        existingFilesContext = `\n\n[PROYECTO ACTUAL — modifica o extiende estos archivos según lo pedido, crea los archivos nuevos que hagan falta]\n${
          includedFiles.join('\n\n---\n\n')
        }`;
      }
    }

    const context = fileContext
      ? { fileContext: fileContext + componentContext + existingFilesContext }
      : (componentContext || existingFilesContext)
        ? { fileContext: componentContext + existingFilesContext }
        : undefined;
    let fullResponse = ''; // only accumulates conversational text (not JSON)
    let enrichedData: EnrichedPayload | null = null;

    try {
      await aiService.streamMessage(
        prompt,
        chatHistory,
        context,
        (chunk) => {
          if (chunk === '__BUILDING__') return;
          fullResponse += chunk;
          set({ streamingContent: fullResponse });
        },
        async (enriched) => {
          enrichedData = enriched;
          set({ generatedCode: enriched.reactCode, generatingFiles: [] });
          await writeFilesToVirtualFS(enriched.files);
          if (enriched.files.length > 0) bootWebContainer(enriched.files);
        },
        () => { /* static preview disabled */ },
        (filePath) => {
          // Real-time file announcement from backend stream
          set(s => ({ generatingFiles: [...s.generatingFiles, filePath] }));
        },
        (_desc) => { /* description preview — no-op for now */ }
      );
    } catch {
      // Fallback: non-streaming
      try {
        fullResponse = await aiService.sendMessage(prompt, chatHistory, context);
      } catch (err) {
        const errorText = err instanceof Error ? err.message : 'Error al contactar la IA';
        set(state => ({
          messages: [...state.messages, {
            role: 'assistant',
            content: `❌ ${errorText}`,
            timestamp: new Date(),
          }],
          sending: false,
          streamingContent: '',
        }));
        return;
      }
    }

    // Build uiData from enrichedData (no JSON parsing of fullResponse needed)
    let parsedUiData: UIComponentData | undefined;
    let messageContent = fullResponse; // plain text for conversational replies

    if (enrichedData) {
      parsedUiData = {
        type: 'ui_component',
        description: enrichedData.description,
        reactCode: enrichedData.reactCode,
        previewHtml: enrichedData.previewHtml,
        designInfo: enrichedData.designInfo ?? { colors: {}, effects: [], layout: '', components: [] },
        files: enrichedData.files,
        timestamp: enrichedData.timestamp,
      };
      messageContent = enrichedData.description || 'Interfaz generada exitosamente.';
      set({ uiData: parsedUiData });
    }

    set(state => ({
      messages: [...state.messages, {
        role: 'assistant',
        content: messageContent,
        timestamp: new Date(),
        uiData: parsedUiData,
      }],
      sending: false,
      streamingContent: '',
    }));
  },

  sendFullProjectRequest: async (prompt: string, framework = 'react') => {
    set({ sending: true, streamingContent: '', previewUrl: '', wcStatus: 'idle', wcLogs: [] });

    const loadingMsg: Message = {
      role: 'assistant',
      content: '🚀 Generando proyecto completo...',
      timestamp: new Date(),
    };
    set(state => ({ messages: [...state.messages, loadingMsg] }));

    try {
      const response = await fetch(`${BASE_URL}/ai/generate-full-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, framework }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json() as {
        success: boolean;
        files: Record<string, string>;
        meta: { name: string; description: string; framework: string; features: string[] };
      };

      if (!data.success) throw new Error('Proyecto no generado correctamente');

      const fileEntries = Object.entries(data.files).map(([path, content]) => ({ path, content }));
      await writeFilesToVirtualFS(fileEntries);

      const mainCode = data.files['/src/App.tsx'] || data.files['src/App.tsx'] || Object.values(data.files)[0] || '';

      set(state => ({
        messages: [...state.messages.slice(0, -1), {
          role: 'assistant',
          content: `✅ **${data.meta.name}** generado con ${fileEntries.length} archivos.\n\n${data.meta.description}`,
          timestamp: new Date(),
        }],
        generatedCode: mainCode,
        sending: false,
      }));

      // Boot WC for full project too
      bootWebContainer(fileEntries);

    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Error generando proyecto';
      set(state => ({
        messages: [...state.messages.slice(0, -1), {
          role: 'assistant',
          content: `❌ ${errorText}`,
          timestamp: new Date(),
        }],
        sending: false,
      }));
    }
  },

  autoFixError: async (errorPrompt: string) => {
    // Silent AI call — adds a system message in chat and applies the fix
    const fixMsg: Message = {
      role: 'assistant',
      content: '🔧 Detecté un error, corrigiéndolo automáticamente...',
      timestamp: new Date(),
    };
    set(state => ({ messages: [...state.messages, fixMsg], sending: true, streamingContent: '' }));

    const { messages } = get();
    const chatHistory: ChatMessage[] = messages.slice(0, -1).map(m => ({
      role: m.role, content: m.content, timestamp: m.timestamp.toISOString(),
    }));

    let fullResponse = '';
    let enrichedData: EnrichedPayload | null = null;

    try {
      await aiService.streamMessage(errorPrompt, chatHistory, undefined,
        (chunk) => { fullResponse += chunk; set({ streamingContent: fullResponse }); },
        async (enriched) => {
          enrichedData = enriched;
          set({ generatedCode: enriched.reactCode, wcError: '' });
          await writeFilesToVirtualFS(enriched.files);
          bootWebContainer(enriched.files);
        }
      );
    } catch {
      fullResponse = await aiService.sendMessage(errorPrompt, chatHistory).catch(() => '');
    }

    let parsedUiData: UIComponentData | undefined;
    try {
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('no json');
      const parsed = JSON.parse(jsonMatch[0]) as UIComponentData;
      if (parsed.type === 'ui_component') {
        parsedUiData = { ...parsed, reactCode: enrichedData?.reactCode || parsed.reactCode || '', previewHtml: '' };
        set({ uiData: parsedUiData, generatedCode: parsedUiData.reactCode, wcError: '' });
      }
    } catch { /* plain text fix */ }

    set(state => ({
      messages: [
        ...state.messages.slice(0, -1),
        { role: 'assistant', content: '✅ Error corregido automáticamente', timestamp: new Date(), uiData: parsedUiData },
      ],
      sending: false,
      streamingContent: '',
    }));
  },

  clearChat: () => set({
    messages: [],
    streamingContent: '',
    generatingFiles: [],
    generatedCode: '',
    previewHtml: '',
    previewUrl: '',
    wcStatus: 'idle',
    wcLogs: [],
    wcError: '',
    uiData: null,
  }),
}));

// Export store reference so helpers above can call setState
const useChatStore = useChat;
