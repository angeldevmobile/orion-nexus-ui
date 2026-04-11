import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import logger from '../utils/logger';
import path from 'path';
import {
  GenerateCodeOptions,
  ProjectStructure,
  FullProjectResult,
  OpenAIMessage,
  ClaudeMessage,
} from '../types/ai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

//   Code tools  

export async function generateCode(options: GenerateCodeOptions): Promise<string> {
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

  if (context?.projectId) systemMessage += `\n\nThis code is for project ID: ${context.projectId}`;
  if (context?.fileContext) systemMessage += `\n\nFile context: ${context.fileContext}`;
  if (context?.codeContext) systemMessage += `\n\nExisting code context: ${context.codeContext}`;

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: prompt },
  ];

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
    messages,
    max_completion_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || (returnJson ? '6000' : '4000')),
  });

  return completion.choices[0]?.message?.content || '// Error al generar código';
}

export async function explainCode(code: string, language: string): Promise<string> {
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

  try {
    const response = await claude.messages.create({
      model: process.env.CLAUDE_MODEL_FAST || 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: 'Eres un experto en explicación de código. Proporciona explicaciones claras y educativas en español.',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.content[0].type === 'text' ? response.content[0].text : 'No pude explicar el código.';
  } catch (error) {
    logger.error('Code Explanation Error (Claude)', { error });
    // Fallback to OpenAI
    const messages: OpenAIMessage[] = [
      { role: 'system', content: 'Eres un experto en explicación de código. Proporciona explicaciones claras y educativas en español.' },
      { role: 'user', content: `Explica el siguiente código ${language}:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ];
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
      messages,
      max_completion_tokens: 1500,
    });
    return completion.choices[0]?.message?.content || 'No pude explicar el código.';
  }
}

export async function optimizeCode(code: string, language: string): Promise<string> {
  const prompt = `Optimiza el siguiente código ${language} para mejorar rendimiento, legibilidad y mejores prácticas:

\`\`\`${language}
${code}
\`\`\`

Proporciona:
1. La versión optimizada del código
2. Explicación de las mejoras realizadas
3. Beneficios de cada optimización

Responde en español.`;

  const messages: OpenAIMessage[] = [
    { role: 'system', content: 'Eres un experto en optimización de código. Proporciona código mejorado y optimizado con explicaciones claras en español.' },
    { role: 'user', content: prompt },
  ];

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
    messages,
    max_completion_tokens: 2500,
  });

  return completion.choices[0]?.message?.content || 'No pude optimizar el código.';
}

export async function reviewCode(code: string, language: string): Promise<string> {
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

  const messages: ClaudeMessage[] = [{ role: 'user', content: prompt }];
  const response = await claude.messages.create({
    model: process.env.CLAUDE_MODEL_FAST || 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: 'Eres un senior developer experto en revisión de código. Proporciona análisis detallados y constructivos en español.',
    messages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'No pude revisar el código.';
}

export async function generateTests(code: string, language: string, framework?: string): Promise<string> {
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
    { role: 'user', content: prompt },
  ];

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
    messages,
    max_completion_tokens: 2000,
  });

  return completion.choices[0]?.message?.content || '// No pude generar los tests';
}

//   Project generation                   ─

function generateProjectName(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('-') || 'mi-proyecto';
}

function arrayToObject(deps: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  deps.forEach(dep => { obj[dep] = 'latest'; });
  return obj;
}

function getBasicProjectStructure(prompt: string, framework: string): ProjectStructure {
  const projectName = generateProjectName(prompt);
  return {
    name: projectName,
    description: `Proyecto generado para: ${prompt}`,
    dependencies: framework === 'react'
      ? ['react', 'react-dom']
      : framework === 'vue' ? ['vue'] : ['typescript'],
    devDependencies: framework === 'react'
      ? ['@types/react', '@types/react-dom', '@vitejs/plugin-react', 'vite', 'typescript']
      : ['vite', 'typescript'],
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    files: [
      {
        path: 'package.json',
        type: 'file',
        content: JSON.stringify({
          name: projectName,
          version: '0.1.0',
          type: 'module',
          scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
        }, null, 2),
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
</html>`,
      },
    ],
  };
}

export async function generateProjectStructure(
  prompt: string,
  framework: string = 'react'
): Promise<ProjectStructure> {
  try {
    const systemMessage = `You are an expert project architect. Generate a complete, modular project structure with all necessary files, dependencies, and configurations.
      Return ONLY a valid JSON object with this exact structure:
      {
        "name": "project-name",
        "description": "Project description",
        "files": [{ "path": "relative/file/path", "content": "file content", "type": "file" }],
        "dependencies": ["dependency1"],
        "devDependencies": ["devDep1"],
        "scripts": { "dev": "command", "build": "command" }
      }
      MODULARITY RULES (REQUIRED):
      - Each file must have ONE responsibility (max ~300 lines per file).
      - Split UI into small components under src/components/.
      - Pages go in src/pages/, one file per page.
      - Custom hooks go in src/hooks/.
      - Types/interfaces go in src/types/.
      - API calls/services go in src/services/.
      - App.tsx must only contain router and providers, no business logic.
      - NEVER put all code in one large file.`;

    const enhancedPrompt = `
      Crea una estructura completa y MODULAR de proyecto para: ${prompt}
      Framework: ${framework}
      Incluye: package.json, vite.config.ts, tsconfig.json, tailwind.config.js, README.md, .gitignore, index.html.
      Estructura de src/ dividida en: pages/ (una por archivo), components/ (mínimo 4 componentes pequeños), hooks/, types/, services/.
      El nombre del proyecto debe ser descriptivo y relacionado con "${prompt}".`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: enhancedPrompt },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
      messages,
      max_completion_tokens: 6000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON found in response');

    const jsonText = jsonMatch[0]
      .replace(/(['`])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    const projectStructure: ProjectStructure = JSON.parse(jsonText);
    if (!projectStructure.name || !projectStructure.files || !Array.isArray(projectStructure.files)) {
      throw new Error('Invalid project structure generated');
    }
    return projectStructure;
  } catch (error) {
    logger.error('Project Structure Generation Error', { error });
    return getBasicProjectStructure(prompt, framework);
  }
}

export async function createProjectFiles(projectStructure: ProjectStructure, basePath: string): Promise<void> {
  const projectPath = path.join(basePath, projectStructure.name);
  await fs.mkdir(projectPath, { recursive: true });

  for (const file of projectStructure.files) {
    const filePath = path.join(projectPath, file.path);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    if (file.type === 'file') await fs.writeFile(filePath, file.content, 'utf8');
  }

  const packageJson = {
    name: projectStructure.name,
    version: '0.1.0',
    description: projectStructure.description,
    type: 'module',
    scripts: projectStructure.scripts,
    dependencies: arrayToObject(projectStructure.dependencies),
    devDependencies: arrayToObject(projectStructure.devDependencies),
  };

  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf8'
  );
  logger.info('Project created', { name: projectStructure.name, path: projectPath });
}

function generateBasicProject(prompt: string, framework: string): FullProjectResult {
  const projectName = generateProjectName(prompt);
  return {
    files: {
      '/package.json': JSON.stringify({
        name: projectName,
        version: '0.1.0',
        type: 'module',
        scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
        dependencies: { react: 'latest', 'react-dom': 'latest' },
        devDependencies: {
          '@types/react': 'latest', '@types/react-dom': 'latest',
          '@vitejs/plugin-react': 'latest', autoprefixer: 'latest',
          postcss: 'latest', tailwindcss: 'latest', typescript: 'latest', vite: 'latest',
        },
      }, null, 2),
      '/index.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      '/public/favicon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#0A0A0F"/>
  <path d="M16 6 L22 10 L22 22 L16 26 L10 22 L10 10 Z" fill="none" stroke="#06B6D4" stroke-width="1.5"/>
  <path d="M16 10 L19 13.5 L16 17 L13 13.5 Z" fill="#8B5CF6"/>
  <circle cx="16" cy="20" r="2" fill="#06B6D4"/>
</svg>`,
      '/public/robots.txt': `User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml`,
      '/public/placeholder.svg': `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="none">
  <rect width="400" height="300" fill="#1a1a2e" rx="8"/>
  <text x="200" y="160" font-family="system-ui" font-size="13" fill="#ffffff40" text-anchor="middle">Sin imagen</text>
</svg>`,
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
      '/src/index.css': `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
      '/vite.config.ts': `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})`,
      '/tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2020', useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'], module: 'ESNext',
          skipLibCheck: true, moduleResolution: 'bundler',
          allowImportingTsExtensions: true, resolveJsonModule: true,
          isolatedModules: true, noEmit: true, jsx: 'react-jsx',
          strict: true, noUnusedLocals: true, noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }],
      }, null, 2),
      '/tailwind.config.js': `/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],\n  theme: { extend: {} },\n  plugins: [],\n}`,
      '/postcss.config.js': `export default {\n  plugins: { tailwindcss: {}, autoprefixer: {} },\n}`,
      '/.gitignore': `logs\n*.log\nnode_modules/\ndist/\n.vscode/*\n!.vscode/extensions.json\n.DS_Store`,
      '/README.md': `# ${projectName}\n\nProyecto generado con IA.\n\n## Instalación\n\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Desarrollo\n\n\`\`\`bash\nnpm run dev\n\`\`\``,
    },
    meta: {
      name: projectName,
      description: `Proyecto generado para: ${prompt}`,
      framework,
      features: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    },
  };
}

export async function generateFullProject(
  prompt: string,
  framework: string = 'react'
): Promise<FullProjectResult> {
  try {
    const systemMessage = `Eres un arquitecto de software experto. Genera un proyecto completo y funcional.

IMPORTANTE: Responde SOLO con JSON válido siguiendo esta estructura EXACTA:
{
  "files": {
    "/package.json": "contenido",
    "/src/App.tsx": "contenido",
    "/src/main.tsx": "contenido",
    "/index.html": "contenido",
    "/vite.config.ts": "contenido",
    "/tsconfig.json": "contenido",
    "/tailwind.config.js": "contenido",
    "/postcss.config.js": "contenido",
    "/.gitignore": "contenido",
    "/README.md": "contenido",
    "/public/favicon.svg": "SVG 32x32",
    "/public/robots.txt": "User-agent: *\\nAllow: /",
    "/public/placeholder.svg": "SVG placeholder"
  },
  "meta": { "name": "nombre", "description": "desc", "framework": "${framework}", "features": [] }
}
REGLAS DE MODULARIDAD (OBLIGATORIAS):
- Cada archivo debe tener UNA sola responsabilidad (máx ~300 líneas por archivo).
- Divide la UI en componentes pequeños en /src/components/.
- Las páginas van en /src/pages/, cada una en su propio archivo.
- Los hooks personalizados van en /src/hooks/.
- Los tipos/interfaces van en /src/types/.
- Los servicios/llamadas API van en /src/services/.
- App.tsx solo debe tener el router y providers, sin lógica de negocio.
- NUNCA pongas todo el código en un solo archivo grande.
- paths con "/", TypeScript + Tailwind CSS, SOLO JSON.`;

    const enhancedPrompt = `Genera un proyecto ${framework} completo y MODULAR para: ${prompt}

Estructura requerida (archivos separados por responsabilidad):
- package.json, vite.config.ts, tsconfig.json, tailwind.config.js, postcss.config.js, index.html, .gitignore, README.md
- /src/main.tsx — solo entry point
- /src/App.tsx — solo router + providers
- /src/pages/ — una página por archivo
- /src/components/ — mínimo 4-6 componentes pequeños y reutilizables
- /src/hooks/ — hooks personalizados si aplica
- /src/types/ — interfaces y tipos
- /src/services/ — lógica de API si aplica
El proyecto debe correr con "npm install && npm run dev".`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: enhancedPrompt },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_MAIN || 'gpt-4o-mini',
      messages,
      max_completion_tokens: 8000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON in response');

    const jsonText = jsonMatch[0]
      .replace(/(['`])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    const result = JSON.parse(jsonText) as FullProjectResult;
    if (!result.files || typeof result.files !== 'object') {
      throw new Error('Invalid project structure: missing files object');
    }
    return result;
  } catch (error) {
    logger.error('Full Project Generation Error', { error });
    return generateBasicProject(prompt, framework);
  }
}
