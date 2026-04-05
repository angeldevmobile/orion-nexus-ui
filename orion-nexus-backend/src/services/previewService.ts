import ts from 'typescript';

const ESM_PACKAGES = [
  'react', 'react-dom', 'lucide-react', 'recharts',
  'clsx', 'tailwind-merge', 'class-variance-authority',
  'framer-motion', 'date-fns', 'zod',
] as const;

type EsmPackage = typeof ESM_PACKAGES[number];

const ESM_FALLBACK: Record<EsmPackage, string> = {
  'react': '18.3.1',
  'react-dom': '18.3.1',
  'lucide-react': '0.294.0',
  'recharts': '2.12.7',
  'clsx': '2.1.1',
  'tailwind-merge': '2.3.0',
  'class-variance-authority': '0.7.0',
  'framer-motion': '11.2.10',
  'date-fns': '3.6.0',
  'zod': '3.23.8',
};

const VERSION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
let esmVersionCache: { versions: Record<EsmPackage, string>; at: number } | null = null;

export async function resolveEsmVersions(): Promise<Record<EsmPackage, string>> {
  if (esmVersionCache && Date.now() - esmVersionCache.at < VERSION_CACHE_TTL) {
    return esmVersionCache.versions;
  }

  const results = await Promise.allSettled(
    ESM_PACKAGES.map(async (pkg) => {
      const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`, {
        signal: AbortSignal.timeout(4000),
      });
      const data = await res.json() as { version: string };
      return [pkg, data.version] as [EsmPackage, string];
    })
  );

  const versions = { ...ESM_FALLBACK };
  for (const r of results) {
    if (r.status === 'fulfilled') {
      const [pkg, version] = r.value;
      versions[pkg] = version;
    }
  }

  esmVersionCache = { versions, at: Date.now() };
  return versions;
}

// Pre-warm the cache at module load so the first request doesn't wait.
resolveEsmVersions().catch(() => { /* ignore — fallback values will be used */ });

/**
 * Strips TypeScript-only syntax that Babel standalone can't handle.
 */
export function stripTypescript(code: string): string {
  try {
    const result = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.Preserve,
        target: ts.ScriptTarget.ES2020,
        removeComments: false,
      },
    });
    return result.outputText;
  } catch {
    return code;
  }
}

/**
 * Topological sort of files based on local import relationships.
 * Files imported by others come first in the output.
 */
export function sortFilesByDependency(
  files: { path: string; content: string }[]
): { path: string; content: string }[] {
  const byName = new Map<string, { path: string; content: string }>();
  for (const f of files) {
    const base = f.path.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') ?? '';
    byName.set(base, f);
  }

  const deps = new Map<string, Set<string>>();
  for (const f of files) {
    const base = f.path.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') ?? '';
    const localImports = [...f.content.matchAll(/from\s+['"]\.\.?\/[^'"]*\/([^/'"]+)['"]/g)]
      .map(m => m[1].replace(/\.(tsx?|jsx?)$/, ''));
    deps.set(base, new Set(localImports.filter(n => byName.has(n))));
  }

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
 * using Import Maps + esm.sh so real ES module imports work in the browser.
 */
export async function generateLovablePreviewHTML(
  files: { path: string; content: string }[]
): Promise<string> {
  const cssFiles = files.filter(f =>
    f.path.endsWith('.css') &&
    !f.path.includes('tailwind') &&
    f.content.trim().length > 0
  );
  const inlinedCss = cssFiles
    .map(f => `/* ${f.path} */\n${f.content}`)
    .join('\n\n');

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

  const sorted = sortFilesByDependency(sourceFiles);

  const externalNamed = new Map<string, Set<string>>();
  const externalDefault = new Map<string, string>();
  const SKIP_PKGS = new Set(['react', 'react-dom', 'react-dom/client']);

  for (const f of sorted) {
    const namedRe = /import\s*\{([^}]+)\}\s*from\s*['"]([^./][^'"]*)['"]/g;
    let m: RegExpExecArray | null;
    while ((m = namedRe.exec(f.content)) !== null) {
      const pkg = m[2];
      if (SKIP_PKGS.has(pkg)) continue;
      const names = m[1]
        .split(',')
        .map(n => n.replace(/\s+as\s+\w+/, '').trim())
        .filter(Boolean);
      if (!externalNamed.has(pkg)) externalNamed.set(pkg, new Set());
      names.forEach(n => externalNamed.get(pkg)!.add(n));
    }
    const defRe = /import\s+(\w+)\s*,?\s*(?:\{[^}]*\})?\s*from\s*['"]([^./][^'"]*)['"]/g;
    while ((m = defRe.exec(f.content)) !== null) {
      if (!SKIP_PKGS.has(m[2])) externalDefault.set(m[2], m[1]);
    }
  }

  const HOOK_NAMES = [
    'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo',
    'createContext', 'useContext', 'useReducer', 'useId',
    'useLayoutEffect', 'useTransition', 'useDeferredValue',
  ];

  const reactNamed = externalNamed.get('react') ?? new Set<string>();
  const allReactNamed = new Set([...HOOK_NAMES, ...reactNamed]);

  const esmImports: string[] = [
    `import React, { ${[...allReactNamed].join(', ')} } from 'react';`,
    `import { createRoot } from 'react-dom/client';`,
  ];

  const seenIdentifiers = new Set<string>();

  const rechartsItems = externalNamed.get('recharts');
  if (rechartsItems && rechartsItems.size > 0) {
    const names = [...rechartsItems].filter(n => !seenIdentifiers.has(n));
    names.forEach(n => seenIdentifiers.add(n));
    if (names.length > 0) esmImports.push(`import { ${names.join(', ')} } from 'recharts';`);
  }

  const lucideIcons = externalNamed.get('lucide-react');
  if (lucideIcons && lucideIcons.size > 0) {
    const names = [...lucideIcons].filter(n => !seenIdentifiers.has(n));
    names.forEach(n => seenIdentifiers.add(n));
    if (names.length > 0) esmImports.push(`import { ${names.join(', ')} } from 'lucide-react';`);
  }

  for (const [pkg, names] of externalNamed) {
    if (pkg === 'lucide-react' || pkg === 'recharts') continue;
    if (SKIP_PKGS.has(pkg)) continue;
    const defImport = externalDefault.get(pkg);
    const dedupedNames = [...names].filter(n => !seenIdentifiers.has(n));
    dedupedNames.forEach(n => seenIdentifiers.add(n));
    const namedPart = dedupedNames.length > 0 ? `{ ${dedupedNames.join(', ')} }` : '';
    const parts = [defImport, namedPart].filter(Boolean).join(', ');
    if (parts) esmImports.push(`import ${parts} from '${pkg}';`);
  }

  for (const [pkg, defName] of externalDefault) {
    if (SKIP_PKGS.has(pkg) || pkg === 'lucide-react' || pkg === 'recharts') continue;
    if (!externalNamed.has(pkg)) esmImports.push(`import ${defName} from '${pkg}';`);
  }

  const bundledParts = sorted.map(f => {
    const isApp = f.path.includes('App.tsx') || f.path.includes('App.jsx');

    const stripped = stripTypescript(f.content)
      .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*\n?/gm, '')
      .replace(/^\s*import\s+['"][^'"]+['"];?\s*\n?/gm, '')
      .replace(/export\s+default\s+function\s+/g, 'function ')
      .replace(/export\s+default\s+class\s+/g, 'class ')
      .replace(/export\s+default\s+/g, '// __default__ ')
      .replace(/^\s*export\s+\{[^}]*\};?\s*\n?/gm, '')
      .replace(/^(\s*)export\s+(const|let|var|function|class)\s+/gm, '$1$2 ')
      .trim();

    if (isApp) return `// ── ${f.path} ──\n${stripped}`;

    const defaultMark = stripped.match(/\/\/ __default__ ([A-Z][A-Za-z0-9_]*)/);
    const fnDecl = stripped.match(/^function ([A-Z][A-Za-z0-9_]*)\s*\(/m);
    const exportName = defaultMark?.[1] ?? fnDecl?.[1];

    if (!exportName) return `// ── ${f.path} ──\n${stripped}`;

    const body = stripped.replace(/\/\/ __default__ [A-Za-z0-9_]*/g, '').trim();
    return `// ── ${f.path} ──\nvar ${exportName} = (() => {\n${body}\n  return ${exportName};\n})();`;
  });

  const bundledCode = bundledParts.join('\n\n');

  const appFile = sorted.find(f => f.path.includes('App.tsx') || f.path.includes('App.jsx'));
  const primaryFile = appFile ?? sorted[sorted.length - 1];
  const primaryCode = primaryFile ? stripTypescript(primaryFile.content) : '';
  const fnMatch = primaryCode.match(/(?:export\s+default\s+)?function\s+([A-Z][A-Za-z0-9_]*)\s*\(/);
  const defaultExport = primaryCode.match(/export\s+default\s+([A-Z][A-Za-z0-9_]*)/);
  const arrowMatch = primaryCode.match(/(?:const|let)\s+([A-Z][A-Za-z0-9_]*)\s*=/);
  const componentName = defaultExport?.[1] || fnMatch?.[1] || arrowMatch?.[1] || 'App';

  const renderCall = `
try {
  createRoot(document.getElementById('root')).render(React.createElement(${componentName}));
} catch(e) {
  const __el = document.getElementById('__preview_error');
  if (__el) { __el.style.display = 'block'; __el.textContent = e.message; }
}`;

  const v = await resolveEsmVersions();
  const R = v['react'];
  const importMap = JSON.stringify({
    imports: {
      "react": `https://esm.sh/react@${R}`,
      "react/jsx-runtime": `https://esm.sh/react@${R}/jsx-runtime`,
      "react-dom": `https://esm.sh/react-dom@${R}`,
      "react-dom/client": `https://esm.sh/react-dom@${R}/client`,
      "lucide-react": `https://esm.sh/lucide-react@${v['lucide-react']}`,
      "recharts": `https://esm.sh/recharts@${v['recharts']}`,
      "clsx": `https://esm.sh/clsx@${v['clsx']}`,
      "tailwind-merge": `https://esm.sh/tailwind-merge@${v['tailwind-merge']}`,
      "class-variance-authority": `https://esm.sh/class-variance-authority@${v['class-variance-authority']}`,
      "framer-motion": `https://esm.sh/framer-motion@${v['framer-motion']}`,
      "date-fns": `https://esm.sh/date-fns@${v['date-fns']}`,
      "zod": `https://esm.sh/zod@${v['zod']}`,
    }
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orion Preview</title>
  <script type="importmap">
  ${importMap}
  </script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    tailwind = { config: {
      theme: {
        extend: {
          colors: {
            primary: '#8B5CF6',
            accent: '#06B6D4',
          }
        }
      }
    }};
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; background: #0F0F1A; overflow: hidden; }
    #root { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
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
  <script type="text/babel" data-type="module" data-presets="react,typescript">
${esmImports.join('\n')}

${bundledCode}

${renderCall}
  </script>
  <script>
    window.addEventListener('error', function(e) {
      var __el = document.getElementById('__preview_error');
      if (__el) { __el.style.display = 'block'; __el.textContent = e.message; }
    });
  </script>
</body>
</html>`;
}
