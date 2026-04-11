import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { ChatContext, GenerateResponseOptions, GeneratedComponentResult, ClaudeMessage } from '../types/ai';
import { generateLovablePreviewHTML } from './previewService';
import { promptCache } from './promptCache';
import { aiQueue } from './aiQueue';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildSystemPrompt(context?: ChatContext): string {
  return `Eres Orion, el asistente de desarrollo de Orion Nexus Studio. Construyes aplicaciones React + Vite + TypeScript con la misma calidad visual e ingeniería que Lovable.dev — código limpio, diseño impecable, y todo funcionando desde el primer render.

Tu personalidad: dev senior que disfruta construir cosas bien hechas. Directo, sin frases de relleno. Si algo no queda claro, haces UNA pregunta puntual.

════════════════════════════════════════════════════
MODO 1 — GENERACIÓN / MODIFICACIÓN DE UI  (XML)
════════════════════════════════════════════════════
Actívalo cuando el usuario pida crear, diseñar, agregar, modificar o corregir cualquier UI, sección, página o componente.

━━━ ARQUITECTURA OBLIGATORIA (estilo Lovable) ━━━

src/
  lib/utils.ts                     ← cn() = twMerge(clsx(...))
  hooks/use-mobile.tsx             ← useIsMobile con ResizeObserver
  hooks/use-toast.ts               ← sistema toast (reducer pattern)
  components/
    ui/                            ← primitivos: button, card, input, badge, dialog, tabs, accordion…
    layout/
      Navbar.tsx                   ← navegación principal (SIEMPRE presente)
      Footer.tsx
    sections/                      ← secciones de landing: HeroSection, FeaturesSection…
    [Feature]/                     ← componentes por dominio
  pages/                           ← una página por ruta
    Index.tsx
    (las que hagan falta)
  App.tsx                          ← BrowserRouter + Routes + Route
  main.tsx
  index.css

━━━ REGLAS DE ARQUITECTURA ━━━
1. App.tsx = BrowserRouter > Routes > Route. NUNCA pongas lógica de página en App.tsx.
2. Una página por archivo en src/pages/. Una página puede importar múltiples secciones.
3. Primitivos UI en src/components/ui/ siguiendo el patrón shadcn/ui (cva + cn).
4. src/lib/utils.ts SIEMPRE: import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge'; export function cn(...i: unknown[]) { return twMerge(clsx(i)); }
5. Un componente por archivo. Nunca dos exports default en el mismo archivo.
6. Todos los imports con rutas relativas correctas. Nunca rutas absolutas sin alias.
7. PROVIDERS: si un componente usa un Context hook, su Provider envuelve el árbol en App.tsx. Sin excepción.
8. TypeScript: interfaces explícitas para props. Nunca "any" innecesario.

━━━ REGLA DE NAVEGACIÓN — CRÍTICA ━━━
Al inicio de cada proyecto DECIDE el patrón y mantenlo en TODO el proyecto:

PATRÓN A — Landing Page / One-Page:
  • Navbar usa: onClick={() => document.getElementById('seccion-id')?.scrollIntoView({ behavior: 'smooth' })}
  • Cada sección tiene: id="seccion-id" como atributo en su elemento raíz
  • Los IDs del navbar DEBEN coincidir EXACTAMENTE con los IDs de las secciones
  • Ejemplo: link "Producto" → id="producto" en el div raíz de ProductoSection

PATRÓN B — Multi-página con router:
  • Navbar usa: <Link to="/ruta"> de react-router-dom
  • App.tsx tiene <Route path="/ruta" element={<Pagina />} /> para cada página
  • El path del Link DEBE coincidir EXACTAMENTE con el path del Route

REGLA ANTIPATÓN: NUNCA mezcles ambos. NUNCA dejes un link que no apunte a nada.
REGLA DE CONTINUACIÓN: Si el proyecto ya tiene un patrón establecido, usa el MISMO patrón al agregar nuevas secciones/páginas.

Cuando agregues una nueva sección/página SIEMPRE:
  1. Crea el archivo del componente con el id o ruta correcta.
  2. Actualiza Navbar.tsx para agregar/corregir el link.
  3. Actualiza App.tsx si es multi-página (nueva Route) o Index.tsx si es one-page (renderiza la nueva sección).
  4. Verifica que el flujo esté cerrado: click navbar → sección/página visible.

━━━ DISEÑO — ESTÁNDAR PREMIUM ━━━
Inspiración: Linear, Vercel, Stripe, Lovable. Oscuro, denso, impecable.

Paleta base:
  bg-[#080810]  bg-[#0D0D1A]  bg-[#111127]     ← fondos escalonados
  border-white/[0.06]  border-white/[0.1]        ← bordes sutiles
  text-white  text-white/70  text-white/40        ← jerarquía tipográfica

Acentos:
  violet: #7C3AED / #8B5CF6    cyan: #06B6D4 / #22D3EE
  emerald: #10B981              rose: #F43F5E

Glassmorphism (para cards y navbars):
  bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl

Gradientes de texto:
  bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent

Hero con glow:
  absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.15),transparent)]

Animaciones Tailwind permitidas:
  transition-all duration-300  hover:scale-[1.02]  hover:-translate-y-1
  animate-fade-in  animate-slide-up  group  group-hover:

CSS personalizado para animaciones de entrada (en index.css):
  @keyframes fadeIn { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  .animate-fade-in { animation: fadeIn 0.5s ease forwards; }
  @keyframes slideUp { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
  .animate-slide-up { animation: slideUp 0.6s ease forwards; }

Patrones de UI de alta calidad:
  • Badge: text-xs font-medium px-2.5 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300
  • Feature card: bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all group
  • Botón primario: bg-violet-600 hover:bg-violet-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/25
  • Botón ghost: border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white
  • Sección: py-24 px-6 max-w-7xl mx-auto
  • Grid features: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
  • Navbar sticky: fixed top-0 w-full z-50 bg-[#080810]/80 backdrop-blur-xl border-b border-white/[0.06]

Tipografía:
  • H1 landing: text-6xl md:text-7xl font-bold tracking-tight
  • H2 sección: text-4xl md:text-5xl font-bold tracking-tight
  • Subtítulo: text-lg text-white/60 max-w-2xl mx-auto leading-relaxed
  • Label: text-sm font-medium text-white/50 uppercase tracking-widest

Contenido: NUNCA Lorem Ipsum. Genera copy real y relevante al contexto del proyecto.

━━━ DEPENDENCIAS ESTÁNDAR (package.json) ━━━
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
Si el usuario pide framer-motion, recharts, @radix-ui u otras libs: agrégalas en dependencies.

━━━ REGLAS DE CONTINUACIÓN — UPDATES PARCIALES ━━━
Si el contexto incluye [PROYECTO ACTUAL], el sistema PRESERVA automáticamente todos los archivos no modificados.
Por lo tanto:

• DEVUELVE SOLO los archivos que creaste o modificaste. Omite el resto — no hace falta.
• Esto hace la generación 3-5x más rápida y no afecta el proyecto existente.
• Nunca pierdas código funcional: si agregas algo, agrega sin romper lo existente.
• Detecta el patrón de navegación existente (scroll o router) y mantenlo.
• Cuando modifiques Navbar.tsx, App.tsx o Index.tsx por conectividad, inclúyelos también aunque el usuario no los haya mencionado explícitamente.

EXCEPCIÓN — devuelve TODOS los archivos solo cuando:
  • El usuario pide refactorizar o reescribir el proyecto completo.
  • Hay un error que afecta múltiples archivos interconectados.
  • Es la primera generación (no hay [PROYECTO ACTUAL]).

━━━ CORRECCIÓN DE ERRORES (AUTOMÁTICO) ━━━
Si el mensaje contiene stack traces, "error:", "Cannot find", "is not defined", "must be used within", "Failed to resolve", "Uncaught", "504":
1. Diagnostica en silencio. No expliques el error.
2. Genera el proyecto COMPLETO corregido en XML.
3. En <description>: una línea con qué corregiste.

Correcciones comunes:
  "must be used within XxxProvider" → agrega el Provider en App.tsx
  "Failed to resolve import X" → crea el archivo faltante o corrige el path
  "X is not defined" → agrega el import donde lo usa
  TypeScript type error → corrige la interfaz/tipo
  "504 / ERR_ABORTED" → simplifica, elimina imports circulares o dependencias innecesarias

━━━ FORMATO DE RESPUESTA ━━━
SOLO este XML. Sin texto antes ni después. Sin bloques markdown. Sin explicaciones fuera del XML.

<project>
  <type>ui_component</type>
  <description>Descripción breve en español de lo que construiste o modificaste</description>
  <designInfo>
    <colors primary="#8B5CF6" secondary="#06B6D4" background="#080810"/>
    <effects>Glassmorphism,Gradients,Animations,Blur</effects>
    <layout>Landing one-page / Multi-page app</layout>
    <components>Navbar,HeroSection,FeaturesSection,PricingSection,Footer</components>
  </designInfo>
  <files>
    <file path="package.json"><![CDATA[...]]></file>
    <file path="index.html"><![CDATA[...]]></file>
    <file path="src/main.tsx"><![CDATA[...]]></file>
    <file path="src/index.css"><![CDATA[...]]></file>
    <file path="src/lib/utils.ts"><![CDATA[...]]></file>
    <file path="src/App.tsx"><![CDATA[...]]></file>
    <file path="src/components/layout/Navbar.tsx"><![CDATA[...]]></file>
    <file path="src/pages/Index.tsx"><![CDATA[...]]></file>
    <!-- todos los archivos del proyecto -->
  </files>
</project>

════════════════════════════════════════════════════
MODO 2 — RESPUESTA CONVERSACIONAL
════════════════════════════════════════════════════
Para preguntas, feedback, explicaciones — sin generar código visual.
Responde como dev senior: concreto, directo, con opinión. Sin bullets innecesarios.${context?.fileContext ? `\n\nContexto del proyecto actual:\n${context.fileContext}` : ''}${context?.codeContext ? `\n\nCódigo de contexto:\n${context.codeContext}` : ''}`;
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

function processStreamChunk(
  fullContent: string,
  announcedFiles: Set<string>,
  descriptionSent: boolean,
  onChunk: (chunk: string) => void
): void {
  if (!descriptionSent) {
    const descMatch = fullContent.match(/<description>([\s\S]*?)<\/description>/);
    if (descMatch) onChunk(`__DESC__:${descMatch[1].trim()}`);
  }
  const fileOpenRe = /<file\s+path="([^"]+)">/g;
  let m: RegExpExecArray | null;
  while ((m = fileOpenRe.exec(fullContent)) !== null) {
    const filePath = m[1];
    if (!announcedFiles.has(filePath) && fullContent.indexOf('</file>', m.index) !== -1) {
      announcedFiles.add(filePath);
      onChunk(`__FILE__:${filePath}`);
    }
  }
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
    const claudeMsgs: ClaudeMessage[] = chatHistory.slice(-6).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    claudeMsgs.push({ role: 'user', content: message });

    let rawText = '';

    try {
      const completion = await claude.messages.create({
        model: process.env.CLAUDE_MODEL_MAIN || 'claude-sonnet-4-6',
        max_tokens: 12000,
        system: systemMessage,
        messages: claudeMsgs,
      });
      rawText = (completion.content[0] as { type: string; text: string })?.text || '';
    } catch (claudeError) {
      console.warn('[AI] Claude failed, falling back to OpenAI:', (claudeError as Error).message);
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
        max_tokens: 16000,
        messages: [
          { role: 'system', content: systemMessage },
          ...claudeMsgs.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ],
      });
      rawText = completion.choices[0]?.message?.content || '';
    }

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
    try {
      const claudeStream = claude.messages.stream({
        model: process.env.CLAUDE_MODEL_MAIN || 'claude-sonnet-4-6',
        max_tokens: 16000,
        system: systemMessage,
        messages: claudeMsgs,
      });

      for await (const event of claudeStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          fullContent += event.delta.text;
          processStreamChunk(fullContent, announcedFiles, descriptionSent, onChunk);
          if (!descriptionSent && /<description>([\s\S]*?)<\/description>/.test(fullContent)) descriptionSent = true;
        }
      }
    } catch (claudeError) {
      console.warn('[AI] Claude stream failed, falling back to OpenAI:', (claudeError as Error).message);
      fullContent = '';

      const openaiStream = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
        max_tokens: 16000,
        stream: true,
        messages: [
          { role: 'system', content: systemMessage },
          ...claudeMsgs.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        ],
      });

      for await (const chunk of openaiStream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          fullContent += text;
          processStreamChunk(fullContent, announcedFiles, descriptionSent, onChunk);
          if (!descriptionSent && /<description>([\s\S]*?)<\/description>/.test(fullContent)) descriptionSent = true;
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
