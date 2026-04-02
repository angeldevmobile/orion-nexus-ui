import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage, ChatContext } from '../types/chatSession';
import fs from 'fs/promises';
import path from 'path';
import constants from 'constants';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateResponseOptions {
  chatHistory?: ChatMessage[];
  context?: ChatContext;
}

interface GenerateCodeOptions {
  prompt: string;
  language?: string;
  framework?: string;
  context?: ChatContext;
  returnJson?: boolean; // <-- nuevo
}

type GeneratedComponentResult = {
  design: {
    palette: Record<string, string>;
    effects: string[];
    layout: string;
    fields?: string[];
  };
  files: { path: string; content: string }[];
  previewHtml: string;
  meta?: { framework?: string; animations?: string[]; styleGuide?: string };
};

interface ProjectStructure {
  name: string;
  description: string;
  files: ProjectFile[];
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
}

interface ProjectFile {
  path: string;
  content: string;
  type: 'file' | 'directory';
}

// Define proper message type for OpenAI
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Define proper message type for Claude
interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 🆕 Agregar interface para el resultado de proyecto completo
interface FullProjectResult {
  files: Record<string, string>;
  meta: {
    name: string;
    description: string;
    framework: string;
    features: string[];
  };
}

class AIService {
  async generateResponse(message: string, options: GenerateResponseOptions = {}): Promise<string> {
    try {
      const { chatHistory = [], context } = options;

      const isUIGenerationRequest = /login|formulario|dashboard|interfaz|pantalla|registro|landing|desplegable|campos|producto|servicio|opciones|tarjeta|navbar|sidebar|modal|tabla|grid|lista|menu|header|footer|card|button|input|form|search|perfil|usuario|configuración|settings|componente/i.test(message);

      if (isUIGenerationRequest) {
        const systemMessage = `Eres un diseñador UI/UX experto y arquitecto de proyectos React+Vite. Tu misión es generar interfaces VISUALMENTE IMPRESIONANTES, modernas y profesionales que sorprendan al usuario, mientras cumples exactamente lo que pide.

FILOSOFÍA DE DISEÑO — aplica SIEMPRE estos principios:
• Paleta oscura premium: fondos #0A0A0F o #0F0F1A, nunca blancos planos
• Acentos vibrantes: cyan #06B6D4, violeta #8B5CF6, emerald #10B981, rose #F43F5E
• Glassmorphism: backdrop-blur-xl, bg-white/5, border border-white/10
• Gradientes ricos: from-cyan-500/20 via-violet-500/10 to-transparent
• Sombras dramáticas: shadow-2xl, shadow-cyan-500/25
• Tipografía con jerarquía: títulos grandes bold, subtítulos con opacidad
• Micro-animaciones: hover:scale-105, transition-all duration-300, hover:shadow-cyan-500/40
• Bordes sutiles: border border-white/10, rounded-2xl, rounded-3xl
• Cards flotantes: bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6
• Inputs elegantes: bg-white/5 border border-white/10 focus:border-cyan-500/50 rounded-xl

GENERA SIEMPRE esta estructura de proyecto Vite completa:
- package.json (con dependencias react, react-dom, tailwindcss)
- index.html (punto de entrada Vite)
- vite.config.ts
- tailwind.config.js
- src/main.tsx (monta la app en #root)
- src/App.tsx (componente raíz que importa los demás)
- src/components/[Feature]/[Component].tsx (componentes específicos del prompt)
- src/hooks/use[Feature].ts (hooks si aplica)
- src/types/index.ts (interfaces/types si aplica)

Responde con este JSON EXACTO (sin texto extra):

{
  "type": "ui_component",
  "description": "Una breve descripción en español (1-2 oraciones) de lo que construiste: qué hace la interfaz, qué estilo visual tiene y qué componentes destacan.",
  "designInfo": {
    "colors": { "primary": "#06B6D4", "secondary": "#8B5CF6", "background": "#0F0F1A" },
    "effects": ["Gradients", "Glassmorphism", "Hover animations"],
    "layout": "Grid/Flexbox moderno",
    "components": ["Navbar", "Card", "Button"]
  },
  "files": [
    {
      "path": "package.json",
      "content": "{\\"name\\":\\"orion-project\\",\\"version\\":\\"1.0.0\\",\\"scripts\\":{\\"dev\\":\\"vite\\",\\"build\\":\\"vite build\\"},\\"dependencies\\":{\\"react\\":\\"^18.2.0\\",\\"react-dom\\":\\"^18.2.0\\"},\\"devDependencies\\":{\\"@types/react\\":\\"^18.2.0\\",\\"@types/react-dom\\":\\"^18.2.0\\",\\"@vitejs/plugin-react\\":\\"^4.0.0\\",\\"tailwindcss\\":\\"^3.3.0\\",\\"typescript\\":\\"^5.0.0\\",\\"vite\\":\\"^4.4.0\\"}}"
    },
    {
      "path": "index.html",
      "content": "<!DOCTYPE html><html lang=\\"es\\"><head><meta charset=\\"UTF-8\\"><meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\"><title>Orion App</title></head><body><div id=\\"root\\"></div><script type=\\"module\\" src=\\"/src/main.tsx\\"></script></body></html>"
    },
    {
      "path": "src/main.tsx",
      "content": "import React from 'react';\\nimport ReactDOM from 'react-dom/client';\\nimport App from './App';\\nimport './index.css';\\nReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);"
    },
    {
      "path": "src/App.tsx",
      "content": "import React from 'react';\\nimport LoginForm from './components/auth/LoginForm';\\nexport default function App() { return <div className=\\"min-h-screen bg-gray-950\\"><LoginForm /></div>; }"
    },
    {
      "path": "src/components/auth/LoginForm.tsx",
      "content": "..."
    }
  ]
}

REGLAS IMPORTANTES:
1. SIEMPRE incluye package.json, index.html, src/main.tsx, src/App.tsx
2. Separa en múltiples archivos con responsabilidades claras
3. Crea subcarpetas lógicas (components/auth/, components/ui/, components/layout/)
4. Todos los imports/exports deben ser correctos y consistentes entre archivos
5. TypeScript estricto con interfaces bien definidas
6. Estilo premium oscuro: glassmorphism, gradientes, animaciones suaves — NUNCA interfaces planas o aburridas
7. Los componentes deben ser funcionales con hooks de React
8. src/App.tsx debe importar y componer todos los demás componentes
9. Escribe la "description" explicando brevemente qué construiste y qué lo hace especial visualmente`;

        // Use Claude Sonnet for UI generation — better React/TS code quality.
        // Request JSON output explicitly in the user message (prefill not supported in Claude 4+).
        const claudeCompletion = await claude.messages.create({
          model: process.env.CLAUDE_MODEL_MAIN || 'claude-sonnet-4-6',
          max_tokens: 16000,
          system: systemMessage,
          messages: [
            { role: 'user', content: `GENERA PROYECTO VITE COMPLETO (responde SOLO con el JSON, sin texto extra ni markdown): ${message}` },
          ],
        });

        const rawText = (claudeCompletion.content[0] as { type: string; text: string })?.text || '';
        if (!rawText) throw new Error('No content generated');

        // Extract JSON object from response (strip any surrounding markdown fences)
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in response');
        const parsed = JSON.parse(jsonMatch[0]);

        const allFiles: { path: string; content: string }[] = parsed.files || [];
        const mainFile = allFiles.find(f => f.path.includes('App.tsx')) || allFiles[0];
        const reactCode = mainFile?.content || '';
        const previewHtml = allFiles.length > 0 ? this.generateLovablePreviewHTML(allFiles) : '';

        return JSON.stringify({
          ...parsed,
          reactCode,
          previewHtml,
          timestamp: new Date().toISOString()
        });
      }

      //  FLUJO NORMAL PARA CHAT CONVERSACIONAL (usar Claude)
      let systemMessage = `You are an AI assistant specialized in web development and coding. 
      You help developers with React, Vue, Angular, TypeScript, JavaScript, and other web technologies.
      Provide helpful, accurate, and concise responses in Spanish.`;

      if (context?.projectId) {
        systemMessage += `\n\nWorking on project ID: ${context.projectId}`;
      }

      if (context?.fileContext) {
        systemMessage += `\n\nCurrent file context: ${context.fileContext}`;
      }

      if (context?.codeContext) {
        systemMessage += `\n\nCode context: ${context.codeContext}`;
      }

      // Use Claude for conversational responses (better for explanations)
      const messages: ClaudeMessage[] = [];

      // Add chat history (last 10 messages for context)
      const recentHistory = chatHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Add current message
      messages.push({
        role: 'user',
        content: message
      });

      const response = await claude.messages.create({
        model: process.env.CLAUDE_MODEL_FAST || 'claude-3-haiku-20240307',
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
        system: systemMessage,
        messages: messages
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'No pude generar una respuesta.';
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  // 🆕 Función auxiliar para convertir JSX básico a HTML estático
  private convertJSXToHTML(reactCode: string): string {
    try {
      // Buscar el return statement del componente
      const returnMatch = reactCode.match(/return\s*\(([\s\S]*?)\);?\s*\}/);
      if (!returnMatch) {
        return '<div style="padding: 2rem; text-align: center;">No se pudo renderizar el componente</div>';
      }

      let jsx = returnMatch[1].trim();

      // Convertir className a class
      jsx = jsx.replace(/className=/g, 'class=');

      // Remover event handlers simples (onClick, onChange, etc.)
      jsx = jsx.replace(/\s*on[A-Z]\w*=\{[^}]*\}/g, '');

      // Convertir variables simples (ej: {count} -> <span id="count">0</span>)
      jsx = jsx.replace(/\{(\w+)\}/g, '<span id="$1">0</span>');

      // Limpiar fragmentos React
      jsx = jsx.replace(/<>|<\/>/g, '');

      return jsx;
    } catch (error) {
      console.error('Error converting JSX:', error);
      return '<div style="padding: 2rem; text-align: center; color: #ef4444;">Error al renderizar el componente</div>';
    }
  }

  private async generateResponseWithOpenAI(message: string, options: GenerateResponseOptions = {}): Promise<string> {
    const { chatHistory = [], context } = options;

    let systemMessage = `You are an AI assistant specialized in web development and coding. 
    You help developers with React, Vue, Angular, TypeScript, JavaScript, and other web technologies.
    Provide helpful, accurate, and concise responses in Spanish.`;

    if (context?.projectId) {
      systemMessage += `\n\nWorking on project ID: ${context.projectId}`;
    }

    if (context?.fileContext) {
      systemMessage += `\n\nCurrent file context: ${context.fileContext}`;
    }

    if (context?.codeContext) {
      systemMessage += `\n\nCode context: ${context.codeContext}`;
    }

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemMessage }
    ];

    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    messages.push({
      role: 'user',
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_FAST || 'gpt-3.5-turbo',
      messages,
      max_completion_tokens: 1500,
      // 🔥 REMOVIDO: temperature (el modelo solo acepta el valor por defecto)
    });

    return completion.choices[0]?.message?.content || 'No pude generar una respuesta.';
  }

  async generateCode(options: GenerateCodeOptions): Promise<string> {
    try {
      const { prompt, language = 'typescript', framework = 'react', context, returnJson = false } = options;

      let systemMessage = '';
      if (returnJson) {
        systemMessage = `Eres un asistente generador de código. **Responde SOLO con un objeto JSON válido** (sin explicaciones ni texto adicional). No incluyas markdown ni triple backticks. Asegúrate que el JSON tenga comillas dobles válidas y escape los caracteres necesarios.`;
      } else if (language === 'html' && framework === 'vanilla') {
        systemMessage = `You are an expert web designer and frontend developer.
        Generate modern, beautiful, and fully functional HTML/CSS/JavaScript code.
        Use Tailwind CSS for all styling (it's already loaded via CDN).
        Create responsive, accessible, and interactive interfaces.
        Always respond in Spanish with the structure requested.
        The code must be production-ready and visually stunning.`;
      } else {
        systemMessage = `You are a code generation AI specialized in ${language} and ${framework}.
        Generate clean, well-structured, and production-ready code.
        Include comments where necessary in Spanish.
        Follow best practices for ${framework} development.
        Always return valid, executable code.`;
      }

      if (context?.projectId) {
        systemMessage += `\n\nThis code is for project ID: ${context.projectId}`;
      }
      if (context?.fileContext) {
        systemMessage += `\n\nFile context: ${context.fileContext}`;
      }
      if (context?.codeContext) {
        systemMessage += `\n\nExisting code context: ${context.codeContext}`;
      }

      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ];

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
        messages,
        max_completion_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || (returnJson ? '6000' : '4000')),
        // 🔥 REMOVIDO: temperature
      });

      return completion.choices[0]?.message?.content || '// Error al generar código';
    } catch (error) {
      console.error('Code Generation Error:', error);
      throw new Error('Failed to generate code');
    }
  }



  async generateProjectStructure(prompt: string, framework: string = 'react'): Promise<ProjectStructure> {
    try {
      const systemMessage = `You are an expert project architect. Generate a complete project structure with all necessary files, dependencies, and configurations.
      Return ONLY a valid JSON object with this exact structure:
      {
        "name": "project-name",
        "description": "Project description",
        "files": [
          {
            "path": "relative/file/path",
            "content": "file content",
            "type": "file"
          }
        ],
        "dependencies": ["dependency1", "dependency2"],
        "devDependencies": ["devDep1", "devDep2"],
        "scripts": {
          "dev": "command",
          "build": "command"
        }
      }`;

      const enhancedPrompt = `
      Crea una estructura completa de proyecto para: ${prompt}
      
      Framework: ${framework}
      
      Incluye:
      - package.json completo con dependencias apropiadas
      - vite.config.ts (si es Vite)
      - tsconfig.json (si es TypeScript)
      - tailwind.config.js (si usa Tailwind)
      - README.md
      - .gitignore
      - index.html (si es frontend)
      - Archivo principal de la aplicación
      - Al menos 2-3 componentes de ejemplo
      - Archivos de configuración necesarios
      - Estructura de carpetas apropiada (src/, public/, etc.)
      
      El nombre del proyecto debe ser descriptivo y relacionado con "${prompt}".
      `;

      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: enhancedPrompt }
      ];

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL_MAIN || 'gpt-4-turbo-preview',
        messages,
        max_completion_tokens: 6000,
        // 🔥 REMOVIDO: temperature
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Full AI response (no JSON):', response);
        throw new Error('No valid JSON found in response');
      }

      let jsonText = jsonMatch[0];
      // Opcional: reparar comillas simples → dobles, eliminar trailing commas
      jsonText = jsonText.replace(/(['`])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":');
      jsonText = jsonText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

      const projectStructure: ProjectStructure = JSON.parse(jsonText);

      // Validate structure
      if (!projectStructure.name || !projectStructure.files || !Array.isArray(projectStructure.files)) {
        throw new Error('Invalid project structure generated');
      }

      return projectStructure;
    } catch (error) {
      console.error('Project Structure Generation Error:', error);
      return this.getBasicProjectStructure(prompt, framework);
    }
  }

  private getBasicProjectStructure(prompt: string, framework: string): ProjectStructure {
    const projectName = this.generateProjectName(prompt);

    const basicStructure: ProjectStructure = {
      name: projectName,
      description: `Proyecto generado para: ${prompt}`,
      dependencies: framework === 'react'
        ? ['react', 'react-dom']
        : framework === 'vue'
          ? ['vue']
          : ['typescript'],
      devDependencies: framework === 'react'
        ? ['@types/react', '@types/react-dom', '@vitejs/plugin-react', 'vite', 'typescript']
        : ['vite', 'typescript'],
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      files: [
        {
          path: 'package.json',
          type: 'file',
          content: JSON.stringify({
            name: projectName,
            version: '0.1.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview'
            }
          }, null, 2)
        },
        {
          path: 'index.html',
          type: 'file',
          content: `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
        }
      ]
    };

    return basicStructure;
  }

  private generateProjectName(prompt: string): string {
    return prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join('-') || 'mi-proyecto';
  }

  async createProjectFiles(projectStructure: ProjectStructure, basePath: string): Promise<void> {
    try {
      const projectPath = path.join(basePath, projectStructure.name);

      // Create project directory
      await fs.mkdir(projectPath, { recursive: true });

      // Create all files and directories
      for (const file of projectStructure.files) {
        const filePath = path.join(projectPath, file.path);
        const fileDir = path.dirname(filePath);

        // Create directory if it doesn't exist
        await fs.mkdir(fileDir, { recursive: true });

        // Create file
        if (file.type === 'file') {
          await fs.writeFile(filePath, file.content, 'utf8');
        }
      }

      // Create package.json with complete configuration
      const packageJson = {
        name: projectStructure.name,
        version: '0.1.0',
        description: projectStructure.description,
        type: 'module',
        scripts: projectStructure.scripts,
        dependencies: this.arrayToObject(projectStructure.dependencies),
        devDependencies: this.arrayToObject(projectStructure.devDependencies)
      };

      await fs.writeFile(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2),
        'utf8'
      );

      console.log(`Project ${projectStructure.name} created successfully at ${projectPath}`);
    } catch (error) {
      console.error('Error creating project files:', error);
      throw new Error('Failed to create project files');
    }
  }

  /**
   * Strips TypeScript-only syntax that Babel standalone can't handle.
   */
  private stripTypescript(code: string): string {
    return code
      // Remove interface declarations (multiline)
      .replace(/^\s*(?:export\s+)?interface\s+\w[\w<>, \[\]|&\s]*\{[^}]*\}/gm, '')
      // Remove type alias declarations
      .replace(/^\s*(?:export\s+)?type\s+\w+\s*=\s*[\s\S]*?;/gm, '')
      // Remove inline TypeScript type annotations on props destructuring: { foo }: MyType → { foo }
      .replace(/\}\s*:\s*\w[\w.<>, \[\]|&]*(?=\s*[\)={])/g, '}')
      // Remove `: Type` annotations on function params and vars (simple cases)
      .replace(/:\s*(?:React\.FC|FC|React\.ReactNode|ReactNode|React\.CSSProperties|string|number|boolean|void|any|never|unknown|null|undefined|Date|object)(?:\[\])?(?=\s*[,)=;{])/g, '')
      // Remove generic type params from function calls: useState<string>( → useState(
      // Uses (\w) lookbehind so JSX tags like <PieChart> are NOT stripped (they have no preceding identifier)
      .replace(/(\w)<[A-Z][A-Za-z0-9_, \[\]|&.]*>/g, '$1')
      // Remove `as Type` casts
      .replace(/\bas\s+[A-Z][A-Za-z0-9_<>, \[\]|&.]*/g, '')
      // Remove non-null assertions
      .replace(/!/g, '')
      .trim();
  }

  /**
   * Topological sort of files based on local import relationships.
   * Files imported by others come first in the output.
   */
  private sortFilesByDependency(files: { path: string; content: string }[]): { path: string; content: string }[] {
    // Build a map: basename → file
    const byName = new Map<string, { path: string; content: string }>();
    for (const f of files) {
      const base = f.path.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') ?? '';
      byName.set(base, f);
    }

    // Build dependency adjacency: file → set of basenames it imports locally
    const deps = new Map<string, Set<string>>();
    for (const f of files) {
      const base = f.path.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') ?? '';
      const localImports = [...f.content.matchAll(/from\s+['"]\.\.?\/[^'"]*\/([^/'"]+)['"]/g)]
        .map(m => m[1].replace(/\.(tsx?|jsx?)$/, ''));
      deps.set(base, new Set(localImports.filter(n => byName.has(n))));
    }

    // Kahn's topological sort
    const inDegree = new Map<string, number>();
    for (const f of files) {
      const base = f.path.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') ?? '';
      if (!inDegree.has(base)) inDegree.set(base, 0);
    }
    for (const [, depSet] of deps) {
      for (const dep of depSet) {
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [name, deg] of inDegree) {
      if (deg === 0) queue.push(name);
    }

    const sorted: string[] = [];
    while (queue.length) {
      const n = queue.shift()!;
      sorted.push(n);
      for (const [name, depSet] of deps) {
        if (depSet.has(n)) {
          const newDeg = (inDegree.get(name) ?? 1) - 1;
          inDegree.set(name, newDeg);
          if (newDeg === 0) queue.push(name);
        }
      }
    }

    // Append any remaining (cycles or unmapped)
    for (const f of files) {
      const base = f.path.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') ?? '';
      if (!sorted.includes(base)) sorted.push(base);
    }

    return sorted
      .map(name => byName.get(name))
      .filter((f): f is { path: string; content: string } => !!f);
  }

  /**
   * Builds a single self-contained HTML document that runs all project files
   * bundled into one <script type="text/babel"> block.
   * This is the "instant" Babel preview shown while WebContainer boots.
   */
  private generateLovablePreviewHTML(files: { path: string; content: string }[]): string {
    // ── CSS files → inlined as <style> tags ───────────────────────────────────
    const cssFiles = files.filter(f =>
      f.path.endsWith('.css') &&
      !f.path.includes('tailwind') &&
      f.content.trim().length > 0
    );
    const inlinedCss = cssFiles
      .map(f => `/* ${f.path} */\n${f.content}`)
      .join('\n\n');

    // ── JS/TSX source files → bundled into one Babel script ──────────────────
    const sourceFiles = files.filter(f =>
      (f.path.endsWith('.tsx') || f.path.endsWith('.jsx') || f.path.endsWith('.ts')) &&
      !f.path.includes('main.tsx') &&
      !f.path.includes('main.ts') &&
      !f.path.includes('vite.config') &&
      !f.path.includes('tailwind.config') &&
      !f.path.includes('.d.ts') &&
      f.content.trim().length > 0
    );

    if (sourceFiles.length === 0) return '';

    // Sort so dependencies come before their consumers
    const sorted = this.sortFilesByDependency(sourceFiles);

    // Build the bundled script: strip imports/exports, wrap each file in IIFE
    // to isolate local helpers (e.g. CustomTooltip defined in multiple files)
    const bundledParts = sorted.map(f => {
      const isApp = f.path.includes('App.tsx') || f.path.includes('App.jsx');

      // Babel (typescript preset) handles TS stripping; we only need to remove
      // ES module import/export syntax since there is no bundler in the browser.
      const stripped = f.content
        // Remove ALL import statements
        .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*\n?/gm, '')
        .replace(/^\s*import\s+['"][^'"]+['"];?\s*\n?/gm, '')
        // export default function Foo → function Foo
        .replace(/export\s+default\s+function\s+/g, 'function ')
        // export default class Foo → class Foo
        .replace(/export\s+default\s+class\s+/g, 'class ')
        // export default ArrowComponent → mark for IIFE return
        .replace(/export\s+default\s+/g, '// __default__ ')
        // export { Foo, Bar } → remove
        .replace(/^\s*export\s+\{[^}]*\};?\s*\n?/gm, '')
        // export const/function/class → const/function/class
        .replace(/^(\s*)export\s+(const|let|var|function|class)\s+/gm, '$1$2 ')
        .trim();

      // App.tsx: no IIFE — rendered directly
      if (isApp) return `// ── ${f.path} ──\n${stripped}`;

      // Find the main exported identifier
      const defaultMark = stripped.match(/\/\/ __default__ ([A-Z][A-Za-z0-9_]*)/);
      const fnDecl = stripped.match(/^function ([A-Z][A-Za-z0-9_]*)\s*\(/m);
      const exportName = defaultMark?.[1] ?? fnDecl?.[1];

      if (!exportName) return `// ── ${f.path} ──\n${stripped}`;

      // Wrap in IIFE: internal helpers stay scoped, exported component leaks out via var
      const body = stripped.replace(/\/\/ __default__ [A-Za-z0-9_]*/g, '').trim();
      return `// ── ${f.path} ──\nvar ${exportName} = (() => {\n${body}\n  return ${exportName};\n})();`;
    });

    const bundledCode = bundledParts.join('\n\n');

    // Find the App component name to render
    const appFile = sorted.find(f => f.path.includes('App.tsx') || f.path.includes('App.jsx'));
    const appCode = appFile ? this.stripTypescript(appFile.content) : '';
    const fnMatch = appCode.match(/(?:export\s+default\s+)?function\s+([A-Z][A-Za-z0-9_]*)\s*\(/);
    const arrowMatch = appCode.match(/(?:const|let)\s+([A-Z][A-Za-z0-9_]*)\s*=/);
    const componentName = fnMatch?.[1] || arrowMatch?.[1] || 'App';

    const renderCall = `
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(${componentName})
  );
} catch(e) {
  document.getElementById('__preview_error').style.display = 'block';
  document.getElementById('__preview_error').textContent = e.message;
}`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orion Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; }
    #root { min-height: 100vh; }
    #__preview_error {
      display: none; padding: 16px; background: #1e1e2e; color: #f38ba8;
      font-family: monospace; font-size: 13px; white-space: pre-wrap;
      border-left: 4px solid #f38ba8; margin: 8px;
    }
  </style>${inlinedCss ? `\n  <style>\n${inlinedCss}\n  </style>` : ''}
</head>
<body>
  <div id="root"></div>
  <div id="__preview_error"></div>
  <script type="text/babel" data-presets="react,typescript">
    const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext, useReducer } = React;

${bundledCode}

${renderCall}
  </script>
  <script>
    window.addEventListener('error', function(e) {
      var el = document.getElementById('__preview_error');
      if (el) { el.style.display = 'block'; el.textContent = e.message; }
    });
  </script>
</body>
</html>`;
  }

  private arrayToObject(deps: string[]): Record<string, string> {
    const depsObject: Record<string, string> = {};
    deps.forEach(dep => {
      depsObject[dep] = 'latest';
    });
    return depsObject;
  }

  async generateReactComponent(prompt: string, context?: ChatContext): Promise<GeneratedComponentResult> {
    const enhancedPrompt = `
Eres un asistente que genera interfaces React + TypeScript + Tailwind (estilo lovable.dev).
DEVUELVE SOLO JSON válido con esta estructura EXACTA:
{
  "design": { "palette": { "primary": "#xxxxxx", "accent": "#xxxxxx", "bg": "#xxxxxx" }, "effects": [...], "layout": "texto", "fields": [...] },
  "files": [{ "path": "src/components/Login.tsx", "content": "..." }, ...],
  "previewHtml": "<!doctype html>... (HTML independiente listo para iframe) ...",
  "meta": { "framework": "react+vite", "styleGuide": "lovable.dev", "animations": [...] }
}
REGLAS:
- Responde **SOLO** con JSON (sin texto extra).
- \`previewHtml\` debe ser un HTML completo que cargue Tailwind y React vía CDN para render directo en un iframe.
- \`files\` deben ser listos para un proyecto React+Vite+TS.
`;

    const raw = await this.generateCode({
      prompt: enhancedPrompt,
      language: 'typescript',
      framework: 'react',
      context,
      returnJson: true
    });

    // Buscar JSON en la respuesta (por seguridad)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in model response');

    let jsonText = jsonMatch[0];
    // Opcional: reparar comillas simples → dobles, eliminar trailing commas
    jsonText = jsonText.replace(/(['`])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":');
    jsonText = jsonText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    let parsed: GeneratedComponentResult;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      console.error('JSON parse error:', err, 'raw:', raw);
      throw new Error('Failed to parse JSON from model response');
    }

    // Validaciones básicas
    if (!parsed.files || !Array.isArray(parsed.files) || typeof parsed.previewHtml !== 'string') {
      throw new Error('Generated object missing required fields');
    }

    return parsed;
  }

  async optimizeCode(code: string, language: string): Promise<string> {
    try {
      const prompt = `Optimiza el siguiente código ${language} para mejorar rendimiento, legibilidad y mejores prácticas:

\`\`\`${language}
${code}
\`\`\`

Proporciona:
1. La versión optimizada del código
2. Explicación de las mejoras realizadas
3. Beneficios de cada optimización

Responde en español.`;

      // Use OpenAI for optimization (better for code transformation)
      const messages: OpenAIMessage[] = [
        { role: 'system', content: 'Eres un experto en optimización de código. Proporciona código mejorado y optimizado con explicaciones claras en español.' },
        { role: 'user', content: prompt }
      ];

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
        messages,
        max_completion_tokens: 2500,
      });

      return completion.choices[0]?.message?.content || 'No pude optimizar el código.';
    } catch (error) {
      console.error('Code Optimization Error:', error);
      throw new Error('Failed to optimize code');
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    try {
      const prompt = `Explica detalladamente el siguiente código ${language}:

\`\`\`${language}
${code}
\`\`\`

Proporciona una explicación clara de:
- Qué hace este código
- Cómo funciona
- Patrones o técnicas notables utilizadas
- Posibles mejoras o consideraciones

Responde en español.`;

      // Use Claude for explanations (better at detailed analysis)
      const messages: ClaudeMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await claude.messages.create({
        model: process.env.CLAUDE_MODEL_MAIN || 'claude-3-5-sonnet-20240620',
        max_tokens: 2000,
        system: 'Eres un experto en explicación de código. Proporciona explicaciones claras y educativas en español.',
        messages: messages
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'No pude explicar el código.';
    } catch (error) {
      console.error('Code Explanation Error:', error);

      // Fallback to OpenAI
      try {
        const messages: OpenAIMessage[] = [
          { role: 'system', content: 'Eres un experto en explicación de código. Proporciona explicaciones claras y educativas en español.' },
          { role: 'user', content: `Explica el siguiente código ${language}:\n\`\`\`${language}\n${code}\n\`\`\`` }
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          max_completion_tokens: 1500,
        });

        return completion.choices[0]?.message?.content || 'No pude explicar el código.';
      } catch (fallbackError) {
        console.error('OpenAI Fallback Error:', fallbackError);
        throw new Error('Failed to explain code');
      }
    }
  }

  async generateTests(code: string, language: string, framework?: string): Promise<string> {
    try {
      const testFramework = framework === 'react' ? 'Jest y React Testing Library' : 'Jest';

      const prompt = `Genera tests unitarios para el siguiente código ${language} usando ${testFramework}:

\`\`\`${language}
${code}
\`\`\`

Incluye:
- Tests para casos exitosos
- Tests para casos de error
- Tests para edge cases
- Mocks cuando sea necesario
- Comentarios explicativos en español

Genera código de test completo y ejecutable.`;

      const messages: OpenAIMessage[] = [
        { role: 'system', content: `Eres un experto en testing de código ${language}. Genera tests completos y bien estructurados usando ${testFramework}.` },
        { role: 'user', content: prompt }
      ];

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
        messages,
        max_completion_tokens: 2000,
      });

      return completion.choices[0]?.message?.content || '// No pude generar los tests';
    } catch (error) {
      console.error('Test Generation Error:', error);
      throw new Error('Failed to generate tests');
    }
  }

  async reviewCode(code: string, language: string): Promise<string> {
    try {
      const prompt = `Realiza una revisión exhaustiva del siguiente código ${language}:

\`\`\`${language}
${code}
\`\`\`

Analiza:
- Calidad del código
- Posibles bugs o problemas
- Mejores prácticas no aplicadas
- Seguridad
- Rendimiento
- Mantenibilidad

Proporciona sugerencias específicas para mejorar. Responde en español.`;

      // Use Claude for code review (better at detailed analysis)
      const messages: ClaudeMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await claude.messages.create({
        model: process.env.CLAUDE_MODEL_MAIN || 'claude-3-5-sonnet-20240620',
        max_tokens: 2000,
        system: 'Eres un senior developer experto en revisión de código. Proporciona análisis detallados y constructivos en español.',
        messages: messages
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'No pude revisar el código.';
    } catch (error) {
      console.error('Code Review Error:', error);
      throw new Error('Failed to review code');
    }
  }

  // 🆕 NUEVA FUNCIÓN: Generar proyecto completo con múltiples archivos
  async generateFullProject(
    prompt: string,
    framework: string = 'react'
  ): Promise<FullProjectResult> {
    try {
      const systemMessage = `Eres un arquitecto de software experto. Genera un proyecto completo y funcional.

IMPORTANTE: Responde SOLO con JSON válido siguiendo esta estructura EXACTA:
{
  "files": {
    "/package.json": "contenido del archivo",
    "/src/App.tsx": "contenido del archivo",
    "/src/main.tsx": "contenido del archivo",
    "/index.html": "contenido del archivo",
    "/vite.config.ts": "contenido del archivo",
    "/tsconfig.json": "contenido del archivo",
    "/tailwind.config.js": "contenido del archivo",
    "/postcss.config.js": "contenido del archivo",
    "/.gitignore": "contenido del archivo",
    "/README.md": "contenido del archivo"
  },
  "meta": {
    "name": "nombre-proyecto",
    "description": "descripción",
    "framework": "${framework}",
    "features": ["feature1", "feature2"]
  }
}

REGLAS:
- Todos los paths deben empezar con "/"
- Genera código funcional y completo
- Usa TypeScript y Tailwind CSS
- Incluye configuraciones necesarias
- No agregues texto explicativo, SOLO JSON`;

      const enhancedPrompt = `Genera un proyecto ${framework} completo para: ${prompt}

Debe incluir:
1. package.json con todas las dependencias necesarias
2. Archivos de configuración (vite.config.ts, tsconfig.json, tailwind.config.js)
3. Código principal en /src/App.tsx (componente funcional y moderno)
4. /src/main.tsx para inicializar React
5. index.html con configuración correcta
6. README.md con instrucciones
7. .gitignore apropiado
8. Al menos 2-3 componentes adicionales en /src/components/
9. Estilos con Tailwind CSS
10. Código TypeScript con tipos correctos

El proyecto debe ser completamente funcional y listo para ejecutar con "npm install && npm run dev"`;

      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: enhancedPrompt }
      ];

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
        messages,
        max_completion_tokens: 8000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from AI');

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', response);
        throw new Error('No valid JSON in response');
      }

      let jsonText = jsonMatch[0];
      jsonText = jsonText
        .replace(/(['`])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');

      const result = JSON.parse(jsonText) as FullProjectResult;

      if (!result.files || typeof result.files !== 'object') {
        throw new Error('Invalid project structure: missing files object');
      }

      return result;
    } catch (error) {
      console.error('Full Project Generation Error:', error);
      return this.generateBasicProject(prompt, framework);
    }
  }

  // 🆕 Proyecto básico de fallback
  private generateBasicProject(
    prompt: string,
    framework: string
  ): FullProjectResult {
    const projectName = this.generateProjectName(prompt);

    return {
      files: {
        '/package.json': JSON.stringify({
          name: projectName,
          version: '0.1.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1'
          },
          devDependencies: {
            '@types/react': '^18.3.1',
            '@types/react-dom': '^18.3.1',
            '@vitejs/plugin-react': '^4.3.0',
            autoprefixer: '^10.4.19',
            postcss: '^8.4.38',
            tailwindcss: '^3.4.3',
            typescript: '^5.4.5',
            vite: '^5.2.11'
          }
        }, null, 2),

        '/index.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,

        '/src/main.tsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,

        '/src/App.tsx': `import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          ${projectName}
        </h1>
        
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            Contador: {count}
          </button>
          
          <p className="mt-6 text-gray-300">
            Edita <code className="bg-gray-700 px-2 py-1 rounded">src/App.tsx</code> para comenzar
          </p>
        </div>
      </div>
    </div>
  )
}`,

        '/src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,

        '/vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,

        '/tsconfig.json': JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true
          },
          include: ['src'],
          references: [{ path: './tsconfig.node.json' }]
        }, null, 2),

        '/tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,

        '/postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,

        '/.gitignore': `# Logs
logs
*.log
npm-debug.log*

# Dependencies
node_modules/

# Build
dist/
dist-ssr/

# Editor
.vscode/*
!.vscode/extensions.json
.idea/

# OS
.DS_Store
Thumbs.db`,

        '/README.md': `# ${projectName}

Proyecto generado con IA.

## Instalación

\`\`\`bash
npm install
\`\`\`

## Desarrollo

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`
`
      },
      meta: {
        name: projectName,
        description: `Proyecto generado para: ${prompt}`,
        framework,
        features: ['React', 'TypeScript', 'Tailwind CSS', 'Vite']
      }
    };
  }

  // ...existing code...

  async streamResponse(
    message: string,
    options: GenerateResponseOptions,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const { chatHistory = [], context } = options;

    const isUIGenerationRequest = /login|formulario|dashboard|interfaz|pantalla|registro|landing|desplegable|campos|producto|servicio|opciones|tarjeta|navbar|sidebar|modal|tabla|grid|lista|menu|header|footer|card|button|input|form|search|perfil|usuario|configuración|settings|componente/i.test(message);

    if (isUIGenerationRequest) {
      const uiSystemMessage = `Eres un experto en arquitectura de proyectos React+Vite. Genera un proyecto Vite COMPLETO.

GENERA SIEMPRE: package.json, index.html, vite.config.ts, tailwind.config.js, src/main.tsx, src/App.tsx, src/components/...

Responde ÚNICAMENTE con este XML (sin texto extra, sin markdown, sin bloques de código):
<project>
  <type>ui_component</type>
  <description>Descripción breve del proyecto</description>
  <designInfo>
    <colors primary="#06B6D4" secondary="#8B5CF6" background="#0F0F1A"/>
    <effects>Gradients,Glassmorphism,Hover animations</effects>
    <layout>Grid/Flexbox moderno</layout>
    <components>Navbar,Card,Button</components>
  </designInfo>
  <files>
    <file path="package.json"><![CDATA[
{contenido exacto del archivo}
    ]]></file>
    <file path="index.html"><![CDATA[
{contenido exacto del archivo}
    ]]></file>
    <file path="src/main.tsx"><![CDATA[
{contenido exacto del archivo}
    ]]></file>
    <file path="src/App.tsx"><![CDATA[
{contenido exacto del archivo}
    ]]></file>
    <file path="src/components/Feature/Component.tsx"><![CDATA[
{contenido exacto del archivo}
    ]]></file>
  </files>
</project>

REGLAS:
1. SIEMPRE incluye package.json, index.html, src/main.tsx, src/App.tsx
2. Múltiples archivos con responsabilidades claras (components/ui/, components/layout/)
3. TypeScript estricto con interfaces
4. Estilo lovable.dev: gradientes, glassmorphism, animaciones, modo oscuro
5. Imports/exports correctos y consistentes entre archivos
6. El contenido de cada archivo va dentro de CDATA — NO escapes caracteres`;

      // Accumulate XML silently — do NOT stream raw chunks to client.
      // Send a single __ENRICHED__ event once generation is complete.
      let fullContent = '';

      // Send a heartbeat so the client knows we're alive
      onChunk('__BUILDING__');

      const claudeStream = claude.messages.stream({
        model: process.env.CLAUDE_MODEL_MAIN || 'claude-sonnet-4-6',
        max_tokens: 16000,
        system: uiSystemMessage,
        messages: [
          { role: 'user', content: `GENERA PROYECTO VITE COMPLETO (responde SOLO con el XML indicado, sin texto extra ni markdown): ${message}` },
        ],
      });

      for await (const event of claudeStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          fullContent += event.delta.text;
        }
      }

      // Parse XML response (no external dependencies)
      const files: Array<{ path: string; content: string }> = [];
      const fileRegex = /<file\s+path="([^"]+)">\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/file>/g;
      let fileMatch: RegExpExecArray | null;
      while ((fileMatch = fileRegex.exec(fullContent)) !== null) {
        files.push({ path: fileMatch[1], content: fileMatch[2].trim() });
      }
      if (files.length === 0) throw new Error('AI did not return valid XML with files');

      const descMatch = fullContent.match(/<description>([\s\S]*?)<\/description>/);
      const description: string = descMatch ? descMatch[1].trim() : '';

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
      const previewHtml = files.length > 0 ? this.generateLovablePreviewHTML(files) : '';

      onChunk('__ENRICHED__:' + JSON.stringify({
        previewHtml,
        reactCode,
        files,
        description,
        designInfo,
        timestamp: new Date().toISOString(),
      }));

    } else {
      let systemMessage = `Eres un asistente de IA especializado en desarrollo web y programación.
Ayudas a desarrolladores con React, Vue, Angular, TypeScript, JavaScript y otras tecnologías web.
Responde siempre en español de forma clara y concisa.`;

      if (context?.fileContext) systemMessage += `\n\nContexto del archivo actual: ${context.fileContext}`;
      if (context?.codeContext) systemMessage += `\n\nCódigo de contexto: ${context.codeContext}`;

      const claudeMsgs: ClaudeMessage[] = chatHistory.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      claudeMsgs.push({ role: 'user', content: message });

      const stream = claude.messages.stream({
        model: process.env.CLAUDE_MODEL_FAST || 'claude-3-haiku-20240307',
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
        system: systemMessage,
        messages: claudeMsgs,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          onChunk(event.delta.text);
        }
      }
    }
  }
}

export const aiService = new AIService();