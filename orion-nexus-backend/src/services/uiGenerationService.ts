import Anthropic from '@anthropic-ai/sdk';
import { ChatContext, GenerateResponseOptions, GeneratedComponentResult, ClaudeMessage } from '../types/ai';
import { generateLovablePreviewHTML } from './previewService';
import { promptCache } from './promptCache';
import { aiQueue } from './aiQueue';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildSystemPrompt(context?: ChatContext): string {
  return `Eres Orion, el asistente de desarrollo de Orion Nexus Studio. Generas aplicaciones React+Vite+TypeScript completas y bien estructuradas, con la misma calidad y organización que Lovable o Bolt.

Tu personalidad:
• Hablas como un dev senior que disfruta construir cosas bien hechas.
• Directo, cálido, nunca corporativo. Sin frases de relleno ("¡Claro!", "¡Genial!").
• Si algo no queda claro, haces UNA pregunta puntual.

TIENES DOS MODOS — decides cuál según el mensaje:

═══════════════════════════════════════════
MODO 1: GENERACIÓN DE PROYECTO (XML)
═══════════════════════════════════════════
Úsalo cuando el usuario pida crear, diseñar, agregar, modificar o mejorar cualquier interfaz, pantalla, sección o componente visual.

━━━ ESTRUCTURA DE PROYECTO OBLIGATORIA ━━━
Todo proyecto DEBE seguir esta estructura (como Lovable):

src/
  lib/
    utils.ts              ← cn() helper + utilidades
  hooks/
    use-mobile.tsx        ← hook responsive
    use-toast.ts          ← sistema de notificaciones
  components/
    ui/                   ← primitivos reutilizables
      button.tsx
      card.tsx
      input.tsx
      badge.tsx
      (los que el proyecto necesite)
    layout/               ← shell de la app
      Navbar.tsx
      Footer.tsx
      Sidebar.tsx (si aplica)
    [Feature]/            ← componentes por dominio
      FeatureCard.tsx
      FeatureList.tsx
  pages/                  ← una página por ruta
    Index.tsx (o Home.tsx)
    Login.tsx
    Register.tsx
    Dashboard.tsx
    (todas las que el proyecto requiera)
  App.tsx                 ← rutas con react-router-dom
  main.tsx
  index.css

━━━ REGLAS DE ARQUITECTURA ━━━
1. App.tsx usa react-router-dom con <BrowserRouter> + <Routes> + <Route>
2. Cada pantalla/página va en src/pages/ — NUNCA todo en App.tsx
3. Componentes reutilizables van en src/components/ui/ (estilo shadcn/ui)
4. Hooks personalizados en src/hooks/
5. src/lib/utils.ts siempre incluye: import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge'; export function cn(...inputs) { return twMerge(clsx(inputs)); }
6. Cada componente en su propio archivo — NUNCA múltiples componentes en un mismo archivo
7. Imports relativos correctos entre todos los archivos

━━━ REGLAS PARA CONTINUACIONES ━━━
• Si el contexto incluye [PROYECTO ACTUAL], PARTA de él. No regeneres desde cero.
• Conserva archivos no modificados. Solo toca lo que el usuario pide.
• Si pide "agregar página de Registro", crea src/pages/Register.tsx + actualiza App.tsx con la nueva ruta.
• Devuelve el proyecto COMPLETO en el XML (todos los archivos, incluyendo sin cambios).

━━━ FILOSOFÍA DE DISEÑO ━━━
• Modo oscuro premium obligatorio: fondos #0A0A0F / #0F0F1A
• Acentos: cyan #06B6D4, violeta #8B5CF6, emerald #10B981, rose #F43F5E
• Glassmorphism: backdrop-blur-xl, bg-white/5, border border-white/10
• Gradientes sutiles, sombras suaves, micro-animaciones (hover:scale-105, transition-all)
• Cards: bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6
• Typography: font-sans para cuerpo, font-mono para código

━━━ PACKAGE.JSON OBLIGATORIO ━━━
Siempre incluye estas dependencias:
{
  "dependencies": {
    "react": "^18.3.1", "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "clsx": "^2.1.1", "tailwind-merge": "^2.5.2",
    "lucide-react": "^0.462.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3", "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "tailwindcss": "^3.4.0", "postcss": "^8.4.0", "autoprefixer": "^10.4.0",
    "typescript": "^5.5.3", "vite": "^5.4.1"
  }
}

━━━ FORMATO DE RESPUESTA ━━━
Responde ÚNICAMENTE con este XML (sin texto extra, sin markdown):

<project>
  <type>ui_component</type>
  <description>Descripción breve en español de lo que construiste</description>
  <designInfo>
    <colors primary="#06B6D4" secondary="#8B5CF6" background="#0F0F1A"/>
    <effects>Gradients,Glassmorphism,Animations</effects>
    <layout>Pages + Components structure</layout>
    <components>Navbar,Button,Card,Input</components>
  </designInfo>
  <files>
    <file path="package.json"><![CDATA[{contenido}]]></file>
    <file path="index.html"><![CDATA[{contenido}]]></file>
    <file path="src/main.tsx"><![CDATA[{contenido}]]></file>
    <file path="src/index.css"><![CDATA[{contenido}]]></file>
    <file path="src/lib/utils.ts"><![CDATA[{contenido}]]></file>
    <file path="src/App.tsx"><![CDATA[{contenido con rutas}]]></file>
    <file path="src/pages/Index.tsx"><![CDATA[{contenido}]]></file>
    <file path="src/components/ui/button.tsx"><![CDATA[{contenido}]]></file>
    ... (todos los archivos necesarios)
  </files>
</project>

═══════════════════════════════════════════
MODO 2: RESPUESTA CONVERSACIONAL
═══════════════════════════════════════════
Para preguntas, feedback, saludos o explicaciones sin generar código visual.
• Como compañero de equipo senior: concreto, directo, con opinión.
• Sin listas de bullets innecesarias — párrafos fluidos cuando aplique.
• Respuestas cortas para preguntas simples.${context?.fileContext ? `\n\nContexto del proyecto actual:\n${context.fileContext}` : ''}${context?.codeContext ? `\n\nCódigo de contexto:\n${context.codeContext}` : ''}`;
}

function parseXmlFiles(rawText: string): { files: { path: string; content: string }[]; description: string } {
  const files: { path: string; content: string }[] = [];
  const fileRegex = /<file\s+path="([^"]+)">\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/file>/g;
  let fileMatch: RegExpExecArray | null;
  while ((fileMatch = fileRegex.exec(rawText)) !== null) {
    files.push({ path: fileMatch[1], content: fileMatch[2].trim() });
  }
  const descMatch = rawText.match(/<description>([\s\S]*?)<\/description>/);
  const description = descMatch ? descMatch[1].trim() : '';
  return { files, description };
}

export async function generateResponse(
  message: string,
  options: GenerateResponseOptions = {}
): Promise<string> {
  const { chatHistory = [], context, userId, userPlan = 'free' } = options;

  // Only cache single-turn requests without history (new UIs from scratch)
  const cacheKey = chatHistory.length === 0
    ? promptCache.key(message, 'ui-v1')
    : null;

  if (cacheKey) {
    const cached = await promptCache.get(cacheKey);
    if (cached) return cached;
  }

  const result = await aiQueue.run(async () => {
    const systemMessage = buildSystemPrompt(context);
    const claudeMsgs: ClaudeMessage[] = chatHistory.slice(-12).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    claudeMsgs.push({ role: 'user', content: message });

    const completion = await claude.messages.create({
      model: process.env.CLAUDE_MODEL_MAIN || 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: systemMessage,
      messages: claudeMsgs,
    });

    const rawText = (completion.content[0] as { type: string; text: string })?.text || '';
    if (!rawText) throw new Error('No content generated');

    const isXmlResponse = rawText.trimStart().startsWith('<project>') || /<file\s+path=/.test(rawText);
    if (!isXmlResponse) return rawText;

    const { files, description } = parseXmlFiles(rawText);
    if (files.length === 0) throw new Error('No valid files in XML response');

    const mainFile = files.find(f => f.path.includes('App.tsx')) || files[0];
    const reactCode = mainFile?.content || '';

    return JSON.stringify({
      type: 'ui_component',
      description,
      reactCode,
      previewHtml: '',
      files,
      designInfo: { colors: {}, effects: [], layout: '', components: [] },
      timestamp: new Date().toISOString(),
    });
  }, userId, userPlan);

  if (cacheKey) await promptCache.set(cacheKey, result);
  return result;
}

export async function streamResponse(
  message: string,
  options: GenerateResponseOptions,
  onChunk: (chunk: string) => void
): Promise<void> {
  const { chatHistory = [], context, userId, userPlan = 'free' } = options;
  const systemMessage = buildSystemPrompt(context);

  const claudeMsgs: ClaudeMessage[] = chatHistory.slice(-12).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
  claudeMsgs.push({ role: 'user', content: message });

  let fullContent = '';
  const announcedFiles = new Set<string>();
  let descriptionSent = false;
  onChunk('__BUILDING__');

  // Heartbeat every 2s so the client timer keeps ticking
  const heartbeat = setInterval(() => onChunk('__BUILDING__'), 2000);

  await aiQueue.run(async () => {
    const claudeStream = claude.messages.stream({
      model: process.env.CLAUDE_MODEL_MAIN || 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: systemMessage,
      messages: claudeMsgs,
    });

    for await (const event of claudeStream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullContent += event.delta.text;

        // Stream description as soon as it's complete
        if (!descriptionSent) {
          const descMatch = fullContent.match(/<description>([\s\S]*?)<\/description>/);
          if (descMatch) {
            onChunk(`__DESC__:${descMatch[1].trim()}`);
            descriptionSent = true;
          }
        }

        // Announce each file the moment its closing tag appears
        const fileOpenRe = /<file\s+path="([^"]+)">/g;
        let m: RegExpExecArray | null;
        while ((m = fileOpenRe.exec(fullContent)) !== null) {
          const filePath = m[1];
          if (!announcedFiles.has(filePath)) {
            const closeIdx = fullContent.indexOf('</file>', m.index);
            if (closeIdx !== -1) {
              announcedFiles.add(filePath);
              onChunk(`__FILE__:${filePath}`);
            }
          }
        }
      }
    }
  }, userId, userPlan);

  clearInterval(heartbeat);

  const isXmlResponse = fullContent.trimStart().startsWith('<project>') || /<file\s+path=/.test(fullContent);

  if (isXmlResponse) {
    const { files, description } = parseXmlFiles(fullContent);
    if (files.length === 0) throw new Error('AI returned XML but no valid files were found');

    const colorsMatch = fullContent.match(/<colors\s+([^/]*?)\/>/);
    const effectsMatch = fullContent.match(/<effects>([\s\S]*?)<\/effects>/);
    const layoutMatch = fullContent.match(/<layout>([\s\S]*?)<\/layout>/);
    const componentsMatch = fullContent.match(/<components>([\s\S]*?)<\/components>/);

    const designInfo = {
      colors: { primary: '#06B6D4', secondary: '#8B5CF6', background: '#0F0F1A' },
      effects: effectsMatch ? effectsMatch[1].split(',').map((s: string) => s.trim()) : [],
      layout: layoutMatch ? layoutMatch[1].trim() : '',
      components: componentsMatch ? componentsMatch[1].split(',').map((s: string) => s.trim()) : [],
    };
    if (colorsMatch) {
      const attrs = colorsMatch[1];
      const pm = attrs.match(/primary="([^"]+)"/);
      const sm = attrs.match(/secondary="([^"]+)"/);
      const bm = attrs.match(/background="([^"]+)"/);
      if (pm) designInfo.colors.primary = pm[1];
      if (sm) designInfo.colors.secondary = sm[1];
      if (bm) designInfo.colors.background = bm[1];
    }

    const mainFile = files.find(f => f.path.includes('App.tsx')) || files[0];
    const reactCode = mainFile?.content || '';

    onChunk('__ENRICHED__:' + JSON.stringify({
      previewHtml: '',
      reactCode,
      files,
      description,
      designInfo,
      timestamp: new Date().toISOString(),
    }));

    // Static preview via esm.sh disabled — WebContainer renders the preview on the client
  } else {
    onChunk(fullContent);
  }
}

export async function generateReactComponent(
  prompt: string,
  _context?: ChatContext,
  userId?: string,
  userPlan: 'free' | 'pro' | 'business' | 'enterprise' = 'free'
): Promise<GeneratedComponentResult> {
  const enhancedPrompt = `
Eres un experto en UI/UX que genera componentes React + TypeScript + Tailwind CSS de calidad premium (estilo lovable.dev / shadcn/ui oscuro).

DEVUELVE SOLO JSON válido con esta estructura EXACTA (sin texto extra, sin markdown):
{
  "design": {
    "palette": { "primary": "#8B5CF6", "accent": "#06B6D4", "bg": "#0F0F1A" },
    "effects": [...],
    "layout": "texto"
  },
  "files": [
    { "path": "src/components/NombreComponente.tsx", "content": "..." }
  ],
  "previewHtml": "",
  "meta": {
    "framework": "react+vite",
    "styleGuide": "dark-premium",
    "animations": [...]
  }
}

==============================
PRIORIDAD DE GENERACIÓN
==============================
1. Fidelidad visual al objeto solicitado
2. Claridad de representación
3. Estética premium (solo después de lo anterior)

==============================
REGLAS DE DISEÑO
==============================
- Estilo oscuro obligatorio (bg-[#0F0F1A], bg-zinc-950, bg-gray-950)
- Diseño moderno tipo dashboard fintech / SaaS
- Uso de glassmorphism, gradientes, sombras suaves
- Bordes redondeados (rounded-xl o superior)
- Espaciado limpio y jerarquía visual clara
- Debe ser visualmente impresionante pero funcional

==============================
REGLAS DE CÓDIGO
==============================
1. FONDO OSCURO obligatorio
2. SOLO colores reales Tailwind o hex inline
3. Animaciones: Tailwind o @keyframes dentro de <style>
4. SIN props externas (usar useState/useEffect con datos internos)
5. SOLO UN archivo .tsx
6. Export default al final
7. previewHtml debe ser ""

Solicitud del usuario:
${prompt}
`;

  const cacheKey = promptCache.key(prompt, 'component-v1');
  const cached = await promptCache.get(cacheKey);
  if (cached) return JSON.parse(cached) as GeneratedComponentResult;

  const parsed = await aiQueue.run(async () => {
    const claudeResponse = await claude.messages.create({
      model: process.env.CLAUDE_MODEL_MAIN || 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: 'Eres un generador de componentes React+TypeScript+Tailwind. Respondes ÚNICAMENTE con JSON válido, sin texto extra ni markdown.',
      messages: [{ role: 'user', content: enhancedPrompt }],
    });

    const rawText = (claudeResponse.content[0] as { type: string; text: string })?.text || '';
    if (!rawText) throw new Error('No content from Claude');

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in model response');

    let result: GeneratedComponentResult;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error('JSON parse error:', err, 'raw:', rawText);
      throw new Error('Failed to parse JSON from model response');
    }

    if (!result.files || !Array.isArray(result.files)) {
      throw new Error('Generated object missing required fields');
    }

    return result;
  }, userId, userPlan);

  await promptCache.set(cacheKey, JSON.stringify(parsed));
  return parsed;
}
