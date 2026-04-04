import { IconSidebar } from "@/components/layout/IconSidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, FolderOpen, X, Check, Layers, Eye, Plus, Code2, Sparkles, Loader2, Monitor } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COMPONENT_CATEGORIES, ComponentEntry, PREVIEW_MAP } from "@/data/componentsLibrary";
import { fileManager } from "@/editor/FileManager";
import { useToast } from "@/hooks/use-toast";
import MonacoEditor from "@/editor/MonacoEditor";
import { apiService } from "@/service/ApiService";
import { aiService } from "@/service/AiService";

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

// ── No-preview placeholder ──────────────────────────────────────────
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
  creator_id: number | null;
  creator_name: string | null;
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
  const [form, setForm] = useState({
    name: "",
    category: COMPONENT_CATEGORIES[0] as string,
    description: "",
    tags: "",
    code: `export function MyComponent() {\n  return (\n    <div className="p-4 text-white">Hello</div>\n  );\n}`,
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

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
      <div className="bg-[#0e0e14] border border-white/10 rounded-2xl w-[95vw] max-w-3xl h-[90vh] flex flex-col shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Plus className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-base font-bold text-white">Nuevo componente</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-6 gap-5">

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

// ── Component Card ───────────────────────────────────────────────────────────
function ComponentCard({
  entry,
  onCopy,
  onUse,
  onExpand,
  copied,
}: {
  entry: ComponentEntry;
  onCopy: (entry: ComponentEntry) => void;
  onUse: (entry: ComponentEntry) => void;
  onExpand: (entry: ComponentEntry) => void;
  copied: string | null;
}) {
  const isCopied = copied === entry.id;
  const catColor = CAT_COLORS[entry.category] ?? "bg-zinc-500/15 text-zinc-300 border-zinc-500/30";

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
        <div className="relative z-10 p-6 flex items-center justify-center">
          {entry.preview ? <entry.preview /> : <NoPreview fileName={entry.fileName} />}
        </div>
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
              <div className="relative z-10">
                {entry.preview ? <entry.preview /> : <NoPreview fileName={entry.fileName} />}
              </div>
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
