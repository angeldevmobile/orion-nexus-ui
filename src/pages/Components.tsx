import { IconSidebar } from "@/components/layout/IconSidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, FolderOpen, X, Check, Layers, Eye, Plus, Code2, Sparkles, Loader2, Monitor, Trash2 } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COMPONENT_CATEGORIES, ComponentEntry, PREVIEW_MAP } from "@/data/componentsLibrary";
import { fileManager } from "@/editor/FileManager";
import { useToast } from "@/hooks/use-toast";
import MonacoEditor from "@/editor/MonacoEditor";
import { apiService } from "@/service/ApiService";
import { aiService } from "@/service/AiService";
import { useAuth } from "@/hooks/useAuth";

// ── Category pill colors ─────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  Buttons:        "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Cards:          "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Forms:          "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Navigation:     "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Layouts:        "bg-pink-500/15 text-pink-300 border-pink-500/30",
  "UI Elements":  "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Animations:     "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  Loaders:        "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "Data Display": "bg-teal-500/15 text-teal-300 border-teal-500/30",
};

// Client-side preview HTML builder (for AI-generated components) 
function buildPreviewHtml(code: string): string {
  // Detect component name BEFORE stripping (export default might be removed)
  const fnMatch = code.match(/export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/);
  const exportMatch = code.match(/export\s+default\s+([A-Z][A-Za-z0-9_]*)/);
  const arrowMatch = code.match(/(?:const|let)\s+([A-Z][A-Za-z0-9_]*)\s*=/);
  const componentName = fnMatch?.[1] ?? exportMatch?.[1] ?? arrowMatch?.[1] ?? 'App';

  // Strip all import statements and export keywords (same as backend bundler)
  const stripped = code
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*\n?/gm, '')
    .replace(/^\s*import\s+['"][^'"]+['"];?\s*\n?/gm, '')
    .replace(/export\s+default\s+function\s+/g, 'function ')
    .replace(/export\s+default\s+class\s+/g, 'class ')
    .replace(/export\s+default\s+/g, '')
    .replace(/^\s*export\s+\{[^}]*\};?\s*\n?/gm, '')
    .replace(/^(\s*)export\s+(const|let|var|function|class)\s+/gm, '$1$2 ')
    // Strip TypeScript "as Type" assertions — Babel standalone chokes on these in JSX attributes
    .replace(/ as (?:React\.[A-Za-z]\w*(?:<[^<>]*>)?|[A-Z][\w.]*(?:<[^<>]*>)?(?:\[\])*|string|number|boolean|bigint|symbol|unknown|any|never|null|undefined|void)(?=[\s),};]|$)/g, '')
    // Strip TypeScript interface declarations
    .replace(/(?:export\s+)?interface\s+\w[\w<>, ]*(?:\s+extends\s+[^{]+)?\s*\{[^}]*\}/g, '')
    // Strip TypeScript type alias declarations
    .replace(/(?:export\s+)?type\s+\w+(?:<[^>]*>)?\s*=\s*[^;]+;/g, '')
    .trim();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18",
      "react/jsx-runtime": "https://esm.sh/react@18/jsx-runtime",
      "react-dom": "https://esm.sh/react-dom@18",
      "react-dom/client": "https://esm.sh/react-dom@18/client",
      "lucide-react": "https://esm.sh/lucide-react@0.462.0",
      "recharts": "https://esm.sh/recharts@2.13.3",
      "clsx": "https://esm.sh/clsx@2.1.1",
      "tailwind-merge": "https://esm.sh/tailwind-merge@2.5.4",
      "framer-motion": "https://esm.sh/framer-motion@11.11.17"
    }
  }
  </script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    tailwind = { config: { theme: { extend: { colors: { primary: '#8B5CF6', accent: '#06B6D4' } } } } };
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; min-height: 100vh; background: #0F0F1A; overflow: hidden; }
    #root { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    #__err { display:none; padding:12px; background:#1e1e2e; color:#f38ba8; font-family:monospace; font-size:12px; white-space:pre-wrap; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="__err"></div>
  <script type="text/babel" data-type="module" data-presets="react,typescript">
    import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext, useReducer, useId } from 'react';
    import { createRoot } from 'react-dom/client';

    ${stripped}

    try {
      createRoot(document.getElementById('root')).render(React.createElement(${componentName}));
    } catch(e) {
      const el = document.getElementById('__err');
      if (el) { el.style.display = 'block'; el.textContent = e.message; }
    }
  </script>
</body>
</html>`;
}

//  No-preview placeholder 
function NoPreview({ fileName }: { fileName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-zinc-600">
      <Code2 className="w-8 h-8" />
      <span className="text-xs font-mono">{fileName ?? "componente"}</span>
      <span className="text-[10px] text-zinc-700">Sin vista previa</span>
    </div>
  );
}

// ── API type (shape returned by GET /api/components) ─────────────────────
interface ApiComponent {
  id: number;
  slug: string | null;
  name: string;
  description: string;
  category: string;
  code: string;
  tags: string[] | null;
  file_name: string | null;
  is_system: boolean;
  framework: string;
  creator_id?: number | null;
  creator_name?: string | null;
  creator?: { id: number; username?: string; email?: string; avatar?: string } | null;
  preview_html?: string | null;
}

function apiToEntry(c: ApiComponent): ComponentEntry {
  const slug = c.slug ?? String(c.id);
  return {
    id: slug,
    name: c.name,
    category: c.category,
    tags: c.tags ?? [],
    description: c.description ?? "",
    preview: PREVIEW_MAP[slug],
    code: c.code,
    fileName: c.file_name ?? `${c.name.replace(/\s+/g, "")}.tsx`,
    dbId: c.id,
    isSystem: c.is_system,
    creatorId: c.creator?.id ?? c.creator_id ?? null,
    previewHtml: c.preview_html ?? null,
  };
}

// ── Create Component Modal ───────────────────────────────────────────
function CreateComponentModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: COMPONENT_CATEGORIES[0] as string,
    description: "",
    tags: "",
    code: `export function MyComponent() {\n  return (\n    <div className="p-4 text-white">Hello</div>\n  );\n}`,
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const result = await aiService.generateComponent(aiPrompt.trim());

      // Pick the best file: prefer a component file over App/main
      const compFile =
        result.files.find(f => !f.path.includes('App.tsx') && !f.path.includes('main.tsx') && f.path.endsWith('.tsx')) ||
        result.files.find(f => f.path.endsWith('.tsx')) ||
        result.files[0];

      if (compFile) {
        const inferredName = compFile.path.replace(/.*\//, '').replace(/\.tsx?$/, '');
        setForm(prev => ({
          ...prev,
          code: compFile.content,
          name: prev.name || inferredName,
          description: prev.description || result.design?.layout || '',
        }));
      }

      if (result.previewHtml) {
        setPreviewHtml(result.previewHtml);
        setShowPreview(true);
      }

      toast({ title: '✨ Componente generado', description: 'Puedes editar el código antes de guardar.' });
    } catch {
      toast({ title: 'Error de IA', description: 'No se pudo generar el componente.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast({ title: "Faltan datos", description: "Nombre y código son obligatorios.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiService.createComponent({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        code: form.code,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        framework: "react",
      });
      toast({ title: "Componente creado", description: `${form.name} guardado en la biblioteca.` });
      onCreated();
      onClose();
    } catch {
      toast({ title: "Error al guardar", description: "No se pudo crear el componente.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors";
  const catColor = CAT_COLORS[form.category] ?? "bg-zinc-500/15 text-zinc-300 border-zinc-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-[#0e0e14] border border-white/10 rounded-2xl w-[95vw] ${showPreview ? 'max-w-6xl' : 'max-w-3xl'} h-[90vh] flex flex-col shadow-2xl shadow-black/50 transition-all duration-300`}
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Plus className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-base font-bold text-white">Nuevo componente</span>
          </div>
          <div className="flex items-center gap-2">
            {previewHtml && (
              <button
                onClick={() => setShowPreview(p => !p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${showPreview ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'text-zinc-400 border-white/10 hover:bg-white/5 hover:text-white'}`}
              >
                <Monitor className="w-3.5 h-3.5" />
                {showPreview ? 'Ocultar preview' : 'Ver preview'}
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: form (left) + optional preview (right) */}
        <div className="flex flex-1 min-h-0">

          {/* Form */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 gap-5">

            {/* AI Prompt Section */}
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-violet-300">Generar con IA</span>
                <span className="text-xs text-zinc-600 ml-auto">Describe el componente</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !generating && handleGenerate()}
                  placeholder='Ej: "Un card de estadísticas con gradiente violeta y animación de contador"'
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating || !aiPrompt.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 transition-colors whitespace-nowrap shadow-lg shadow-violet-500/20"
                >
                  {generating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generar</>
                  )}
                </button>
              </div>
            </div>

            {/* Nombre + Categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Nombre <span className="text-violet-400">*</span></label>
                <input value={form.name} onChange={set("name")} placeholder="Mi Componente" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Categoría</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCatOpen(o => !o)}
                    className="w-full flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm transition-colors hover:border-violet-500/40 focus:outline-none"
                  >
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${catColor}`}>
                      {form.category}
                    </span>
                    <svg className={`w-4 h-4 text-zinc-500 transition-transform ${catOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {catOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                      {COMPONENT_CATEGORIES.map(c => {
                        const cc = CAT_COLORS[c] ?? "bg-zinc-500/15 text-zinc-300 border-zinc-500/30";
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { setForm(p => ({ ...p, category: c })); setCatOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/5 ${form.category === c ? 'bg-white/5' : ''}`}
                          >
                            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${cc}`}>{c}</span>
                            {form.category === c && <svg className="w-3.5 h-3.5 text-violet-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Descripción</label>
              <input value={form.description} onChange={set("description")} placeholder="Breve descripción del componente" className={inputCls} />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                Tags <span className="text-zinc-600">(separados por coma)</span>
              </label>
              <input value={form.tags} onChange={set("tags")} placeholder="button, animado, hover" className={inputCls} />
            </div>

            {/* Código con Monaco */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Código <span className="text-violet-400">*</span></label>
              <div className="flex-1 rounded-xl overflow-hidden border border-white/10 min-h-[260px]">
                <MonacoEditor
                  filePath={`/components/${form.name.replace(/\s+/g, '') || 'MyComponent'}.tsx`}
                  code={form.code}
                  onChange={v => setForm(p => ({ ...p, code: v }))}
                  fontFamily="Fira Code"
                  fontSize={13}
                  editorTheme="VS Code Dark"
                  autocomplete={true}
                />
              </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          {showPreview && (
            <div className="w-[48%] border-l border-white/10 flex flex-col flex-shrink-0">
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-zinc-300">Vista previa en vivo</span>
                <span className="ml-auto text-[10px] text-zinc-600">Renderizado</span>
              </div>
              <div className="flex-1 min-h-0 bg-[#080810]">
                <iframe
                  srcDoc={previewHtml}
                  sandbox="allow-scripts"
                  title="AI Component Preview"
                  className="w-full h-full border-0"
                  {...({ credentialless: '' } as object)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 flex-shrink-0">
          <p className="text-xs text-zinc-600">Los campos con <span className="text-violet-400">*</span> son obligatorios</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-zinc-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 transition-colors shadow-lg shadow-violet-500/20"
            >
              <Plus className="w-4 h-4" />
              {saving ? "Guardando..." : "Crear componente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryPill({ cat, active, onClick }: { cat: string; active: boolean; onClick: () => void }) {
  const color = CAT_COLORS[cat] ?? "bg-zinc-500/15 text-zinc-300 border-zinc-500/30";
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
        active
          ? `${color} scale-105 shadow-sm`
          : "bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white"
      }`}
    >
      {cat}
    </button>
  );
}

// Component Card 
function ComponentCard({
  entry,
  onCopy,
  onUse,
  onExpand,
  copied,
  currentUserId,
  onDelete,
}: {
  entry: ComponentEntry;
  onCopy: (entry: ComponentEntry) => void;
  onUse: (entry: ComponentEntry) => void;
  onExpand: (entry: ComponentEntry) => void;
  copied: string | null;
  currentUserId?: string | null;
  onDelete?: (entry: ComponentEntry) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isCopied = copied === entry.id;
  const catColor = CAT_COLORS[entry.category] ?? "bg-zinc-500/15 text-zinc-300 border-zinc-500/30";
  const canDelete = !entry.isSystem && entry.dbId != null && currentUserId && entry.creatorId === parseInt(currentUserId);
  // Build iframe preview for API components that have no static preview
  const iframePreview = !entry.preview && entry.dbId != null && entry.code
    ? (entry.previewHtml || buildPreviewHtml(entry.code))
    : null;

  return (
    <div className="group relative bg-[#111118] border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-200 flex flex-col">
      {/* Preview area */}
      <div
        className="relative flex items-center justify-center bg-zinc-950 overflow-hidden cursor-pointer"
        style={{ minHeight: 180 }}
        onClick={() => onExpand(entry)}
      >
        {/* Grid background */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff12 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        {iframePreview ? (
          <iframe
            srcDoc={iframePreview}
            sandbox="allow-scripts"
            title={entry.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '200%',
              border: 'none',
              pointerEvents: 'none',
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
            }}
            {...({ credentialless: '' } as object)}
          />
        ) : (
          <div className="relative z-10 p-6 flex items-center justify-center">
            {entry.preview ? <entry.preview /> : <NoPreview fileName={entry.fileName} />}
          </div>
        )}
      </div>

      {/* Info strip */}
      <div className="px-4 py-3 bg-[#0d0d12] border-t border-white/8 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{entry.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{entry.description}</p>
          </div>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
            {entry.category}
          </span>
        </div>

        {/* Confirm delete overlay */}
        {confirmDelete && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            <span className="text-xs text-red-300 flex-1">¿Eliminar este componente?</span>
            <button
              onClick={() => { onDelete?.(entry); setConfirmDelete(false); }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors"
            >
              Sí, eliminar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onExpand(entry)}
            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver código
          </button>
          <button
            onClick={() => onCopy(entry)}
            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? "Copiado" : "Copiar"}
          </button>
          <button
            onClick={() => onUse(entry)}
            className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Usar
          </button>
          {canDelete && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
              title="Eliminar componente"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
function ComponentModal({
  entry,
  onClose,
  onCopy,
  onUse,
  copied,
}: {
  entry: ComponentEntry;
  onClose: () => void;
  onCopy: (entry: ComponentEntry) => void;
  onUse: (entry: ComponentEntry) => void;
  copied: string | null;
}) {
  const isCopied = copied === entry.id;
  const catColor = CAT_COLORS[entry.category] ?? "bg-zinc-500/15 text-zinc-300 border-zinc-500/30";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden w-[95vw] max-w-7xl h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-white">{entry.name}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
              {entry.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCopy(entry)}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? "Copiado" : "Copiar código"}
            </button>
            <button
              onClick={() => onUse(entry)}
              className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Usar en proyecto
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: preview left, code right */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Preview panel */}
          <div className="w-2/5 flex-shrink-0 flex flex-col border-r border-white/8 bg-zinc-950">
            <div className="px-4 py-2.5 border-b border-white/8">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Vista previa</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle, #ffffff18 1px, transparent 1px)", backgroundSize: "28px 28px" }}
              />
              {entry.preview ? (
                <div className="relative z-10">
                  <entry.preview />
                </div>
              ) : (entry.previewHtml || entry.code) && entry.dbId != null ? (
                <iframe
                  srcDoc={entry.previewHtml || buildPreviewHtml(entry.code)}
                  sandbox="allow-scripts"
                  title={entry.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  {...({ credentialless: '' } as object)}
                />
              ) : (
                <div className="relative z-10">
                  <NoPreview fileName={entry.fileName} />
                </div>
              )}
            </div>
          </div>

          {/* Code panel */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Código</span>
              <span className="text-xs text-zinc-600 font-mono">{entry.fileName}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                filePath={`/components/${entry.fileName}`}
                code={entry.code}
                onChange={() => {}}
                fontFamily="Fira Code"
                fontSize={13}
                editorTheme="VS Code Dark"
                autocomplete={false}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="px-6 py-3 border-t border-white/8 flex items-center gap-2">
          <span className="text-xs text-zinc-600">Tags:</span>
          {entry.tags.map(t => (
            <span key={t} className="text-[10px] text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Components() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalEntry, setModalEntry] = useState<ComponentEntry | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [allComponents, setAllComponents] = useState<ComponentEntry[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch from API and merge with static PREVIEW_MAP
  const loadFromApi = useCallback(async () => {
    try {
      const res = await apiService.getComponents({ limit: 200 }) as { data?: ApiComponent[] };
      const apiComponents = res?.data;
      if (Array.isArray(apiComponents) && apiComponents.length > 0) {
        setAllComponents(apiComponents.map(apiToEntry));
        setApiLoaded(true);
      }
    } catch {
      // Silently fall back to static library
    }
  }, []);

  useEffect(() => { loadFromApi(); }, [loadFromApi]);

  // Filter
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allComponents.filter(c => {
      const matchesCat = !activeCategory || c.category === activeCategory;
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.includes(q));
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, activeCategory, allComponents]);

  // Counts per category
  const counts = useMemo(() =>
    Object.fromEntries(
      COMPONENT_CATEGORIES.map(cat => [
        cat,
        allComponents.filter(c => c.category === cat).length,
      ])
    ), [allComponents]);

  const handleCopy = useCallback((entry: ComponentEntry) => {
    navigator.clipboard.writeText(entry.code).catch(() => {});
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Código copiado", description: `${entry.name} listo para pegar.` });
  }, [toast]);

  const handleDelete = useCallback(async (entry: ComponentEntry) => {
    if (!entry.dbId) return;
    try {
      await apiService.deleteComponent(entry.dbId);
      setAllComponents(prev => prev.filter(c => c.id !== entry.id));
      toast({ title: "Componente eliminado", description: `${entry.name} fue eliminado.` });
    } catch {
      toast({ title: "Error al eliminar", description: "No se pudo eliminar el componente.", variant: "destructive" });
    }
  }, [toast]);

  const handleUse = useCallback(async (entry: ComponentEntry) => {
    try {
      const path = `/src/components/${entry.fileName}`;
      const dir = path.split('/').slice(0, -1).join('/');
      if (dir && dir !== '/') await fileManager.createFolder(dir).catch(() => {});
      await fileManager.writeFile(path, entry.code);
      sessionStorage.setItem('orion:fs:fresh', 'true');
      toast({
        title: "Componente añadido",
        description: `${entry.fileName} fue agregado al proyecto.`,
      });
      navigate('/editor');
    } catch {
      toast({ title: "Error", description: "No se pudo agregar al proyecto.", variant: "destructive" });
    }
  }, [navigate, toast]);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <IconSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/8 px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white leading-none">Biblioteca de Componentes</h1>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {allComponents.length} componentes{apiLoaded && " · desde base de datos"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
                  {filtered.length} resultados
                </Badge>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Crear
                </button>
              </div>
            </div>

            {/* Search + filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48 max-w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                <Input
                  placeholder="Buscar por nombre, tag..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 bg-white/5 border-white/10 text-sm text-white placeholder:text-zinc-600 focus-visible:ring-violet-500/30"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <CategoryPill
                  cat="Todos"
                  active={activeCategory === null}
                  onClick={() => setActiveCategory(null)}
                />
                {COMPONENT_CATEGORIES.map(cat => (
                  <CategoryPill
                    key={cat}
                    cat={`${cat} (${counts[cat]})`}
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="px-8 py-6 max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <Layers className="w-10 h-10 text-zinc-700" />
              <p className="text-zinc-400 font-medium">Sin resultados</p>
              <p className="text-zinc-600 text-sm">Intenta con otro término o categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(entry => (
                <ComponentCard
                  key={entry.id}
                  entry={entry}
                  onCopy={handleCopy}
                  onUse={handleUse}
                  onExpand={setModalEntry}
                  copied={copiedId}
                  currentUserId={user?.id}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalEntry && (
        <ComponentModal
          entry={modalEntry}
          onClose={() => setModalEntry(null)}
          onCopy={handleCopy}
          onUse={e => { handleUse(e); setModalEntry(null); }}
          copied={copiedId}
        />
      )}

      {showCreate && (
        <CreateComponentModal
          onClose={() => setShowCreate(false)}
          onCreated={loadFromApi}
        />
      )}
    </div>
  );
}
