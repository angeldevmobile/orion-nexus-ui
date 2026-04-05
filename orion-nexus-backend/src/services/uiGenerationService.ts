import Anthropic from '@anthropic-ai/sdk';
import { ChatContext, GenerateResponseOptions, GeneratedComponentResult, ClaudeMessage } from '../types/ai';
import { generateLovablePreviewHTML } from './previewService';
import { promptCache } from './promptCache';
import { aiQueue } from './aiQueue';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildSystemPrompt(context?: ChatContext): string {
  return `Eres Orion, un asistente de diseño y desarrollo web especializado en crear interfaces React+Vite visualmente impresionantes, al estilo de lovable.dev.

TIENES DOS MODOS DE RESPUESTA — tú decides cuál usar según el mensaje del usuario y el historial de conversación:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODO 1: GENERACIÓN DE INTERFAZ (XML)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Úsalo cuando el usuario pida crear, diseñar, agregar, continuar, modificar o mejorar cualquier interfaz, pantalla, sección, componente o elemento visual. Esto incluye peticiones como "continúa", "agrega una sección de X", "modifica el diseño", "hazlo más X", o cualquier petición que implique generar o actualizar código visual.

REGLAS CRÍTICAS PARA CONTINUACIONES:
• Si el contexto incluye archivos del proyecto actual (marcados con [PROYECTO ACTUAL]), DEBES partir de ellos. NO generes un proyecto desde cero.
• Conserva todos los archivos existentes sin cambios. Solo modifica o añade lo que el usuario pide.
• Si pide "agregar sección de Ventas", crea el componente nuevo y actualiza App.tsx para integrarlo, sin tocar lo demás.
• Siempre devuelve el proyecto COMPLETO en el XML (todos los archivos, incluyendo los no modificados).

FILOSOFÍA DE DISEÑO — aplica siempre:
• Paleta oscura premium: fondos #0A0A0F o #0F0F1A
• Acentos vibrantes: cyan #06B6D4, violeta #8B5CF6, emerald #10B981, rose #F43F5E
• Glassmorphism: backdrop-blur-xl, bg-white/5, border border-white/10
• Gradientes: from-cyan-500/20 via-violet-500/10 to-transparent
• Sombras: shadow-2xl, shadow-cyan-500/25
• Micro-animaciones: hover:scale-105, transition-all duration-300
• Cards: bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6

Responde ÚNICAMENTE con este XML (sin texto extra, sin markdown, sin bloques de código):
<project>
  <type>ui_component</type>
  <description>Descripción breve en español de lo que construiste</description>
  <designInfo>
    <colors primary="#06B6D4" secondary="#8B5CF6" background="#0F0F1A"/>
    <effects>Gradients,Glassmorphism,Hover animations</effects>
    <layout>Grid/Flexbox moderno</layout>
    <components>Navbar,Card,Button</components>
  </designInfo>
  <files>
    <file path="package.json"><![CDATA[
{contenido exacto}
    ]]></file>
    <file path="index.html"><![CDATA[
{contenido exacto}
    ]]></file>
    <file path="src/main.tsx"><![CDATA[
{contenido exacto}
    ]]></file>
    <file path="src/App.tsx"><![CDATA[
{contenido exacto}
    ]]></file>
    <file path="src/components/Feature/Component.tsx"><![CDATA[
{contenido exacto}
    ]]></file>
  </files>
</project>

REGLAS MODO 1:
1. SIEMPRE incluye package.json, index.html, src/main.tsx, src/App.tsx
2. Múltiples archivos con responsabilidades claras (components/ui/, components/layout/)
3. TypeScript estricto con interfaces bien definidas
4. El contenido de cada archivo va dentro de CDATA
5. Imports/exports correctos y consistentes entre todos los archivos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODO 2: RESPUESTA CONVERSACIONAL (texto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Úsalo cuando el usuario haga preguntas, dé feedback general, salude, o pida explicaciones sin solicitar cambios visuales. Responde en español, de forma clara y concisa, sin XML.${context?.fileContext ? `\n\nContexto de archivos disponible:\n${context.fileContext}` : ''}${context?.codeContext ? `\n\nCódigo de contexto:\n${context.codeContext}` : ''}`;
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
    const previewHtml = files.length > 0 ? await generateLovablePreviewHTML(files) : '';

    return JSON.stringify({
      type: 'ui_component',
      description,
      reactCode,
      previewHtml,
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
  onChunk('__BUILDING__');

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
      }
    }
  }, userId, userPlan);

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

    if (files.length > 0) {
      generateLovablePreviewHTML(files)
        .then(previewHtml => {
          if (previewHtml) onChunk('__PREVIEW__:' + JSON.stringify({ previewHtml }));
        })
        .catch(() => { /* preview is optional */ });
    }
  } else {
    onChunk(fullContent);
  }
}

export async function generateReactComponent(
  prompt: string,
  _context?: ChatContext,
  userId?: string,
  userPlan: 'free' | 'pro' | 'enterprise' = 'free'
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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIORIDAD DE GENERACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Fidelidad visual al objeto solicitado
2. Claridad de representación
3. Estética premium (solo después de lo anterior)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS DE DISEÑO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Estilo oscuro obligatorio (bg-[#0F0F1A], bg-zinc-950, bg-gray-950)
- Diseño moderno tipo dashboard fintech / SaaS
- Uso de glassmorphism, gradientes, sombras suaves
- Bordes redondeados (rounded-xl o superior)
- Espaciado limpio y jerarquía visual clara
- Debe ser visualmente impresionante pero funcional

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS DE CÓDIGO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    try {
      const robustPreview = await generateLovablePreviewHTML(result.files);
      if (robustPreview) result.previewHtml = robustPreview;
    } catch {
      // keep the AI-generated preview as fallback
    }

    return result;
  }, userId, userPlan);

  await promptCache.set(cacheKey, JSON.stringify(parsed));
  return parsed;
}
