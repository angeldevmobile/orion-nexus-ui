import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Sparkles,
  Code2,
  Eye,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  ExternalLink,
  Upload,
  Github,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChat, Message, WcStatus } from "@/hooks/useChat";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/service/ApiService";
import MonacoEditor from "../editor/MonacoEditor";
import { dumpFsToJson } from "@/editor/fileSystem/lightningFsAdapter";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { buildProject } from "@/editor/runtime/orionContainer";
import ReactMarkdown from "react-markdown";
import type { UIComponentData } from "@/service/AiService";

// ─── Conversational response shown for ui_component AI responses ─────────────
function DesignCard({ data }: { data: UIComponentData }) {
  const description = data.description?.trim();

  return (
    <div className="bg-secondary text-foreground rounded-2xl px-4 py-3 space-y-2 max-w-[90%]">
      <div className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm leading-relaxed">
          {description
            ? `${description} Si quieres hacer cambios o ajustes, solo dímelo.`
            : 'Listo, he diseñado lo que pediste. Puedes verlo en el preview. Si quieres cambios, indícame.'}
        </p>
      </div>
    </div>
  );
}

// ─── Individual chat message ─────────────────────────────────────────────────
function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl px-4 py-3">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs opacity-60 mt-1 text-right">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  }

  // Assistant message with uiData → show design card
  if (message.uiData) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] space-y-2">
          <DesignCard data={message.uiData} />
          <p className="text-xs text-gray-500 pl-1">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] bg-secondary text-foreground rounded-2xl px-4 py-3">
        <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        <p className="text-xs opacity-60 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

// ─── Simple loading bar shown while WebContainer boots ───────────────────────
const STATUS_PCT: Partial<Record<WcStatus, number>> = {
  booting: 25, installing: 60, starting: 85, ready: 100,
};

function BuildProgressBar({ status }: { status: WcStatus }) {
  if (status === 'idle') return null;
  const pct = STATUS_PCT[status] ?? 0;
  return (
    <div className="h-0.5 w-full bg-transparent overflow-hidden flex-shrink-0">
      <div
        className="h-full bg-gradient-to-r from-primary via-violet-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Animated loading skeleton while WC boots ────────────────────────────────
function PreviewLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#0A0A0F] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-72">
        {/* Orion logo pulse */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_40px] shadow-cyan-500/20 animate-pulse">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border border-cyan-500/10 animate-ping" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-white/80">Construyendo tu interfaz</p>
          <p className="text-xs text-white/40 mt-1">El preview en vivo aparecerá en unos segundos</p>
        </div>

        {/* Skeleton lines */}
        <div className="w-full space-y-2.5">
          {/* Navbar skeleton */}
          <div className="h-10 bg-white/5 border border-white/5 rounded-xl animate-pulse" />
          {/* Hero skeleton */}
          <div className="h-24 bg-white/5 border border-white/5 rounded-xl animate-pulse [animation-delay:200ms]" />
          {/* Cards row */}
          <div className="flex gap-2">
            <div className="flex-1 h-16 bg-white/5 border border-white/5 rounded-xl animate-pulse [animation-delay:400ms]" />
            <div className="flex-1 h-16 bg-white/5 border border-white/5 rounded-xl animate-pulse [animation-delay:600ms]" />
            <div className="flex-1 h-16 bg-white/5 border border-white/5 rounded-xl animate-pulse [animation-delay:800ms]" />
          </div>
          {/* Content skeleton */}
          <div className="h-12 bg-white/5 border border-white/5 rounded-xl animate-pulse [animation-delay:1000ms]" />
        </div>
      </div>
    </div>
  );
}

// ─── 3D rotating card carousel shown while generating ────────────────────────
// SVG icons for generation slides
function IconBolt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
function IconBrain({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2a2.5 2.5 0 0 1 5 0v.5" />
      <path d="M16 6.5A2.5 2.5 0 0 1 18.5 9v.5" />
      <path d="M19 13a2.5 2.5 0 0 1 0 5h-.5" />
      <path d="M14.5 21a2.5 2.5 0 0 1-5 0v-.5" />
      <path d="M8 17.5A2.5 2.5 0 0 1 5.5 15v-.5" />
      <path d="M5 11a2.5 2.5 0 0 1 0-5h.5" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconPalette({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}
function IconRocket({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22 22 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const GENERATION_SLIDES = [
  {
    Icon: IconBolt,
    title: "Generando componentes",
    subtitle: "Construyendo la arquitectura de tu UI en tiempo real",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
    iconColor: "text-cyan-400",
    dot: "bg-cyan-400",
  },
  {
    Icon: IconBrain,
    title: "IA analizando diseño",
    subtitle: "Claude está optimizando la estructura y los estilos",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20",
    iconColor: "text-violet-400",
    dot: "bg-violet-400",
  },
  {
    Icon: IconPalette,
    title: "Aplicando Tailwind CSS",
    subtitle: "Diseño responsivo y accesible desde el primer momento",
    color: "from-pink-500/20 to-pink-500/5",
    border: "border-pink-500/30",
    glow: "shadow-pink-500/20",
    iconColor: "text-pink-400",
    dot: "bg-pink-400",
  },
  {
    Icon: IconRocket,
    title: "Preparando el preview",
    subtitle: "WebContainer listo para ejecutar tu proyecto al instante",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    iconColor: "text-amber-400",
    dot: "bg-amber-400",
  },
  {
    Icon: IconLink,
    title: "Conectando módulos",
    subtitle: "Enrutamiento, estado y props enlazados automáticamente",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    iconColor: "text-emerald-400",
    dot: "bg-emerald-400",
  },
];

function GenerationProgress({ generatingFiles: _ }: { generatingFiles: string[] }) {
  const [elapsed, setElapsed] = useState(0);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setElapsed(0);
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate every 2.8s
  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent(c => (c + 1) % GENERATION_SLIDES.length);
        setAnimating(false);
      }, 350);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const slide = GENERATION_SLIDES[current];

  return (
    <div className="h-full bg-[#080810] flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/6 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-violet-500/6 rounded-full blur-3xl animate-pulse [animation-delay:1.4s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Grid dots background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs px-6">
        {/* Orion logo */}
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shadow-[0_0_60px] shadow-cyan-500/15">
            <Sparkles className="w-7 h-7 text-cyan-400" />
          </div>
          <div className="absolute -inset-1.5 rounded-3xl border border-cyan-500/15 animate-ping [animation-duration:2s]" />
        </div>

        {/* 3D flipping card */}
        <div className="w-full" style={{ perspective: '800px' }}>
          <div
            style={{
              transform: animating ? 'rotateY(90deg) scale(0.92)' : 'rotateY(0deg) scale(1)',
              opacity: animating ? 0 : 1,
              transition: 'transform 350ms cubic-bezier(0.4,0,0.2,1), opacity 350ms ease',
            }}
          >
            <div className={`w-full bg-gradient-to-b ${slide.color} border ${slide.border} rounded-2xl p-5 shadow-xl ${slide.glow} shadow-lg`}>
              <div className="flex items-start gap-4">
                <slide.Icon className={`w-7 h-7 flex-shrink-0 mt-0.5 ${slide.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/90 leading-snug">{slide.title}</p>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {GENERATION_SLIDES.map((s, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${
                i === current ? `w-5 h-1.5 ${s.dot}` : 'w-1.5 h-1.5 bg-white/15'
              }`}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-primary/50 border-t-primary animate-spin" />
          <span>{elapsed}s</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const FULL_PROJECT_RE =
  /proyecto completo|proyecto nuevo|crea un proyecto|genera proyecto|estructura completa|app completa|aplicación completa|sistema completo|plataforma|arquitectura/i;

export default function AIChat() {
  const [message, setMessage] = useState('');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('preview');
  const [viteReady, setViteReady] = useState(false);
  const [buildingPreview, setBuildingPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    sending,
    streamingContent,
    generatingFiles,
    generatedCode,
    previewUrl,
    wcStatus,
    wcError,
    uiData,
    sendMessage,
    sendFullProjectRequest,
    clearChat,
    autoFixError,
    loadTemplateFiles,
  } = useChat() as ReturnType<typeof useChat> & { wcError: string; autoFixError: (e: string) => Promise<void> };

  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  // Auto-select App.tsx when files arrive
  useEffect(() => {
    if (uiData?.files?.length) {
      const appFile = uiData.files.find(f => f.path.includes('App.tsx')) ?? uiData.files[0];
      setSelectedFilePath(appFile.path);
    }
  }, [uiData?.files]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // Load template when navigated with ?fork=ID
  useEffect(() => {
    const forkId = searchParams.get('fork');
    if (!forkId || messages.length > 0) return;

    apiService.get<{ data: { name: string; files: Record<string, string> | { path: string; content: string }[] } }>(
      `/projects/${forkId}`
    ).then(res => {
      const { name, files } = res.data;
      let fileEntries: { path: string; content: string }[];
      if (Array.isArray(files)) {
        fileEntries = files.filter(f => f.path && !f.path.endsWith('/'));
      } else {
        fileEntries = Object.entries(files ?? {})
          .filter(([path]) => path && !path.endsWith('/'))
          .map(([path, content]) => ({ path, content }));
      }
      if (fileEntries.length > 0) {
        loadTemplateFiles(name, fileEntries);
      }
    }).catch(() => {
      toast({ title: "Error", description: "No se pudo cargar la plantilla.", variant: "destructive" });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isAdmin = user?.role === "admin";
  const userPlan = user?.preferences?.subscription ?? (user as unknown as { plan?: string })?.plan ?? "free";
  const canPublish = isAdmin || userPlan === "pro" || userPlan === "business" || userPlan === "enterprise";
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportName, setExportName] = useState("mi-proyecto");
  const [chatVisible, setChatVisible] = useState(true);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishName, setPublishName] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [pushingGitHub, setPushingGitHub] = useState(false);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [builtPreviewUrl, setBuiltPreviewUrl] = useState<string | null>(null);

  const handlePushGitHub = async () => {
    setPushingGitHub(true);
    try {
      const snapshot = await import("@/editor/fileSystem/lightningFsAdapter")
        .then(m => m.dumpFsToJson()).catch(() => ({}));
      const name = `Proyecto ${new Date().toLocaleDateString("es")}`;
      const res = await apiService.post<{ data: { id: string } }>("/projects", {
        name,
        description: "",
        isPublic: false,
        settings: { framework: "vanilla", language: "javascript" },
        files: snapshot,
      });
      const pushRes = await apiService.post<{ data: { repoUrl: string } }>(
        `/projects/${res.data.id}/push-to-github`
      );
      toast({
        title: "¡Repositorio creado!",
        description: (
          <span>
            Tu proyecto está en GitHub:{" "}
            <a
              href={pushRes.data.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              {pushRes.data.repoUrl}
            </a>
          </span>
        ),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("No GitHub account linked")) {
        setGithubDialogOpen(true);
      } else {
        toast({ title: "Error", description: msg || "No se pudo conectar con GitHub.", variant: "destructive" });
      }
    } finally {
      setPushingGitHub(false);
    }
  };

  const handleConnectGitHub = () => {
    const backendUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";
    window.location.href = `${backendUrl}/api/auth/github`;
  };

  const handlePublish = async (type: "template" | "community") => {
    if (type === "community" && !canPublish) {
      toast({
        title: "Plan insuficiente",
        description: "Publicar proyectos en la comunidad requiere el plan Pro o superior. Actualiza tu plan en Precios.",
        variant: "destructive",
      });
      return;
    }

    setPublishing(true);
    try {
      const snapshot = await import("@/editor/fileSystem/lightningFsAdapter")
        .then(m => m.dumpFsToJson()).catch(() => ({}));

      const name = publishName.trim() || `Proyecto ${new Date().toLocaleDateString("es")}`;
      const description = publishDescription.trim();

      // Capture preview screenshot from the iframe
      let thumbnail: string | undefined;
      try {
        const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement | null;
        if (iframe?.contentWindow && previewUrl) {
          thumbnail = await new Promise<string | undefined>((resolve) => {
            const timeout = setTimeout(() => resolve(undefined), 8000);
            const handler = (ev: MessageEvent) => {
              if (ev.data?.type === 'orion-screenshot') {
                clearTimeout(timeout);
                window.removeEventListener('message', handler);
                resolve(ev.data.dataUrl as string | undefined);
              }
            };
            window.addEventListener('message', handler);
            iframe.contentWindow!.postMessage({ type: 'orion-capture' }, '*');
          });
        }
      } catch { /* ignore — publish without thumbnail */ }

      const res = await apiService.post<{ data: { id: string } }>("/projects", {
        name,
        description,
        isPublic: type === "community",
        settings: { framework: "react", language: "typescript", thumbnail, ...(builtPreviewUrl ? { previewUrl: builtPreviewUrl } : {}) },
        files: snapshot,
      });
      await apiService.post(`/projects/${res.data.id}/publish`, { type });
      toast({
        title: type === "template" ? "Publicado como plantilla" : "Publicado en comunidad",
        description: `"${name}" ya está disponible ${type === "template" ? "como plantilla" : "en la comunidad"}.`,
      });
      setPublishOpen(false);
      setPublishName("");
      setPublishDescription("");
    } catch {
      toast({ title: "Error", description: "No se pudo publicar el proyecto.", variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Auto-switch to preview tab when WebContainer starts booting
  useEffect(() => {
    if (wcStatus !== 'idle') setActiveTab('preview');
  }, [wcStatus]);

  // Reset Vite ready state each time a new URL arrives
  useEffect(() => {
    setViteReady(false);
  }, [previewUrl]);

  // Auto-fix: capture HMR errors from the preview iframe and trigger AI correction
  useEffect(() => {
    if (wcStatus !== 'ready') return;

    let lastFix = 0;
    const failedModules = new Set<string>();
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const handleMessage = (event: MessageEvent) => {
      // Vite HMR client posts messages from the iframe origin
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      // Vite HMR error format: { type: 'error', err: { message, stack } }
      if (data.type === 'error' && data.err?.message) {
        const errMsg: string = data.err.message + (data.err.stack ? '\n' + data.err.stack : '');
        const now = Date.now();
        if (now - lastFix < 10000) return; // debounce: max one fix per 10s
        lastFix = now;
        autoFixError(`Error en el preview (HMR):\n\`\`\`\n${errMsg}\n\`\`\``);
      }
    };

    // Also watch for repeated "Failed to reload" via MutationObserver on iframe load failures
    const handleIframeError = () => {
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement | null;
      if (!iframe) return;
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;
        // If iframe loaded an error page, the body will be minimal
        const bodyText = iframeDoc.body?.innerText ?? '';
        if (bodyText.includes('Failed to resolve') || bodyText.includes('Cannot find module')) {
          const now = Date.now();
          if (now - lastFix < 10000) return;
          lastFix = now;
          autoFixError(`Error en el preview:\n\`\`\`\n${bodyText.slice(0, 500)}\n\`\`\``);
        }
      } catch { /* cross-origin — ignore */ }
    };

    // Intercept console errors forwarded via postMessage from Vite's error overlay
    const handleViteOverlay = (event: MessageEvent) => {
      if (typeof event.data === 'string' && event.data.startsWith('vite-hmr-error:')) {
        const errMsg = event.data.slice('vite-hmr-error:'.length);
        failedModules.add(errMsg);
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const now = Date.now();
          if (now - lastFix < 10000) return;
          lastFix = now;
          const combined = Array.from(failedModules).join('\n');
          failedModules.clear();
          autoFixError(`Módulos que fallaron al recargar (HMR):\n\`\`\`\n${combined}\n\`\`\``);
        }, 2000);
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('message', handleViteOverlay);
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement | null;
    iframe?.addEventListener('load', handleIframeError);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('message', handleViteOverlay);
      iframe?.removeEventListener('load', handleIframeError);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [wcStatus, autoFixError]);

  const handleSend = async () => {
    const prompt = message.trim();
    if (!prompt || sending) return;
    setMessage('');
    textareaRef.current?.focus();

    if (FULL_PROJECT_RE.test(prompt)) {
      await sendFullProjectRequest(prompt);
      toast({
        title: 'Proyecto generado',
        description: 'Todos los archivos están listos en el editor',
        action: (
          <Button size="sm" onClick={() => navigate('/editor')} className="bg-primary hover:bg-primary/90">
            Abrir Editor
          </Button>
        ),
      });
    } else {
      await sendMessage(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExport = async () => {
    const name = exportName.trim() || "mi-proyecto";
    try {
      const allFiles = await dumpFsToJson();
      const zip = new JSZip();
      for (const [filePath, content] of Object.entries(allFiles)) {
        const relativePath = filePath.replace(/^\//, "");
        if (relativePath) zip.file(relativePath, content);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${name}.zip`);
      toast({ title: 'Exportado', description: `${Object.keys(allFiles).length} archivos exportados como ZIP` });
      setExportDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'No se pudo exportar', variant: 'destructive' });
    }
  };


  const handleOpenInNewTab = async () => {
    if (buildingPreview) return;
    setBuildingPreview(true);
    try {
      toast({ title: 'Buildeando...', description: 'Compilando el proyecto, un momento.' });
      const distFiles = await buildProject();

      // Fix asset paths in index.html so they work as relative URLs
      if (distFiles['index.html']) {
        distFiles['index.html'] = distFiles['index.html']
          .replace(/src="\/assets\//g, 'src="./assets/')
          .replace(/href="\/assets\//g, 'href="./assets/');
      }

      const backendBase = (import.meta.env.VITE_API_URL as string || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
      const res = await fetch(`${backendBase}/api/preview/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: distFiles }),
      });
      if (!res.ok) throw new Error('Upload falló');
      const { url } = await res.json() as { url: string };

      // Save or update the project with the permanent previewUrl
      try {
        const snapshot = await import("@/editor/fileSystem/lightningFsAdapter")
          .then(m => m.dumpFsToJson()).catch(() => ({}));
        if (currentProjectId) {
          await apiService.put(`/projects/${currentProjectId}`, {
            settings: { framework: "react", language: "typescript", previewUrl: url },
          });
        } else {
          const saveRes = await apiService.post<{ data: { id: string } }>("/projects", {
            name: `Proyecto ${new Date().toLocaleDateString("es")}`,
            description: "",
            isPublic: false,
            settings: { framework: "react", language: "typescript", previewUrl: url },
            files: snapshot,
          });
          setCurrentProjectId(saveRes.data.id);
        }
        setBuiltPreviewUrl(url);
      } catch { /* ignore — preview still opens */ }

      window.open(url, '_blank');
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'No se pudo publicar', variant: 'destructive' });
    } finally {
      setBuildingPreview(false);
    }
  };

  const deviceClass = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-[1024px] mx-auto',
    mobile: 'w-[375px] h-[667px] mx-auto',
  }[device];

  // Scale the iframe so desktop-layout content fits inside tablet/mobile frames.
  // The iframe renders at DESKTOP_W px wide and is scaled down to the device width.
  const DESKTOP_W = 1280;
  const deviceW = device === 'mobile' ? 375 : device === 'tablet' ? 768 : DESKTOP_W;
  const deviceH = device === 'mobile' ? 667 : device === 'tablet' ? 1024 : undefined;
  const iframeScale = deviceW / DESKTOP_W;
  const iframeStyle: React.CSSProperties = device === 'desktop'
    ? { width: '100%', height: '100%', border: 'none' }
    : {
        width: `${DESKTOP_W}px`,
        height: deviceH ? `${Math.round(deviceH / iframeScale)}px` : '100%',
        border: 'none',
        transform: `scale(${iframeScale})`,
        transformOrigin: 'top left',
      };


  return (
    <>
    <div className="h-screen bg-background flex overflow-hidden">

      <IconSidebar />

      {/* ── Left: Chat ───────────────────────────────────────────── */}
      {chatVisible && (
      <div className="w-[360px] flex-shrink-0 border-r border-border flex flex-col bg-card">
        {/* Minimal top bar — only trash when there are messages */}
        {messages.length > 0 && (
          <div className="px-3 py-2 border-b border-border flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearChat} title="Limpiar chat">
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
          {messages.length === 0 && !sending && (
            <div className="h-full flex flex-col items-center justify-center px-4 space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-heading font-semibold text-base">¿Qué quieres construir?</h2>
                <p className="text-xs text-muted-foreground">
                  Describe tu idea y lo genero con preview en vivo
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                {[
                  { icon: Monitor,    label: 'Quiero un dashboard de ventas',       prompt: 'Crea un dashboard con gráficas de ventas y métricas en modo oscuro' },
                  { icon: Eye,        label: 'Necesito un formulario de login',     prompt: 'Diseña un formulario de login moderno con glassmorphism y animaciones' },
                  { icon: Smartphone, label: 'Diseña una landing page para mi app', prompt: 'Genera una landing page moderna para una app SaaS con hero, features y pricing' },
                  { icon: Code2,      label: 'Crea mi página de registro',          prompt: 'Crea un formulario de registro con validación y diseño premium' },
                ].map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => { setMessage(prompt); textareaRef.current?.focus(); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary hover:bg-secondary/70 border border-border hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <ChatBubble key={idx} message={msg} />
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="max-w-[90%] bg-secondary text-foreground rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {streamingContent ? 'Diseñando tu interfaz...' : 'Generando...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: 'Crea un dashboard con gráficas de ventas y modo oscuro'"
              className="min-h-[72px] bg-background border-border resize-none text-sm [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              size="lg"
              className="bg-primary hover:bg-primary/90 h-[72px] px-4"
              disabled={sending || !message.trim()}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      </div>

      )}

      {/* ── Right: Preview / Code ────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        {/* Toolbar */}
        <div className="border-b border-border px-3 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setChatVisible(v => !v)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title={chatVisible ? 'Ocultar chat' : 'Mostrar chat'}
            >
              {chatVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="preview" className="gap-2 text-xs">
                <Eye className="w-3.5 h-3.5" />
                Vista Previa
                {wcStatus === 'ready' && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                )}
                {wcStatus !== 'idle' && wcStatus !== 'ready' && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2 text-xs">
                <Code2 className="w-3.5 h-3.5" />
                Código
                {generatedCode && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-blue-500 inline-block" />
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 bg-secondary rounded-lg">
              {([
                { key: 'desktop', icon: Monitor },
                { key: 'tablet',  icon: Tablet },
                { key: 'mobile',  icon: Smartphone },
              ] as const).map(({ key, icon: Icon }) => (
                <Button
                  key={key}
                  variant={device === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice(key)}
                  className="h-7 w-7 p-0"
                >
                  <Icon className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)} className="text-xs h-7">
              <Download className="w-3 h-3 mr-1" />
              Exportar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/editor')}
              disabled={!generatedCode}
              className="text-xs h-7"
            >
              <Code2 className="w-3 h-3 mr-1" />
              Abrir Editor
            </Button>
            {wcStatus === 'ready' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                disabled={buildingPreview}
                className="text-xs h-7 border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                {buildingPreview ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <ExternalLink className="w-3 h-3 mr-1" />
                )}
                Nueva pestaña
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePushGitHub}
              disabled={!generatedCode || pushingGitHub}
              className="text-xs h-7 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
            >
              {pushingGitHub ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Github className="w-3 h-3 mr-1" />
              )}
              GitHub
            </Button>
            <Button
              size="sm"
              onClick={() => setPublishOpen(true)}
              disabled={!generatedCode}
              className="text-xs h-7 bg-primary hover:bg-primary/90"
            >
              <Upload className="w-3 h-3 mr-1" />
              Publicar
            </Button>
          </div>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="preview" className="h-full mt-0 p-0 flex flex-col">
              {wcStatus !== 'idle' && wcStatus !== 'ready' && (
                <BuildProgressBar status={wcStatus} />
              )}

              <div className="flex-1 overflow-hidden relative">
                {previewUrl ? (
                  <div className={`h-full flex items-start justify-center overflow-auto animate-in fade-in duration-500 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-white/30 ${device !== 'desktop' ? 'bg-muted/20 p-4' : ''}`}>
                    <div
                      className={`${deviceClass} overflow-hidden transition-all duration-300 relative ${device !== 'desktop' ? 'bg-[#0F0F1A] rounded-lg border border-white/10 shadow-2xl' : ''}`}
                      style={{ minHeight: device === 'desktop' ? '100%' : undefined }}
                    >
                      <iframe
                        src={previewUrl}
                        title="Vista Previa — Vite"
                        style={{
                          ...iframeStyle,
                          opacity: viteReady ? 1 : 0,
                          transition: 'opacity 0.5s ease',
                        }}
                        onLoad={() => setViteReady(true)}
                      />
                      {!viteReady && (
                        <div className="absolute inset-0">
                          <PreviewLoadingSkeleton />
                        </div>
                      )}
                    </div>
                  </div>
                ) : sending ? (
                  <GenerationProgress generatingFiles={generatingFiles} />
                ) : wcStatus === 'error' ? (
                  <div className="h-full bg-[#080810] flex flex-col items-center justify-center gap-5 p-8">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div className="text-center space-y-1 max-w-xs">
                      <p className="text-sm font-semibold text-white/80">No se pudo cargar el preview</p>
                      <p className="text-xs text-white/35 leading-relaxed">{wcError || 'El WebContainer tardó demasiado o encontró un error.'}</p>
                    </div>
                    <button
                      onClick={() => { if (uiData?.files) { import('@/hooks/useChat').then(m => { /* trigger retry via clearChat + resend is complex; just reload */ window.location.reload(); }); } }}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 hover:text-white/90 transition-all"
                    >
                      Recargar página
                    </button>
                  </div>
                ) : wcStatus !== 'idle' ? (
                  <div className="relative h-full">
                    <PreviewLoadingSkeleton />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-white/30">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-primary/50 border-t-primary animate-spin" />
                      <span>{wcStatus === 'booting' ? 'Iniciando WebContainer...' : wcStatus === 'installing' ? 'Instalando dependencias...' : 'Iniciando servidor Vite...'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col bg-[#0d0d14] relative overflow-hidden">
                    {/* Ambient glow */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
                      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/6 rounded-full blur-3xl" />
                    </div>

                    {/* Mock browser chrome */}
                    <div className="relative z-10 flex-1 flex flex-col p-6 gap-4">
                      {/* Browser bar */}
                      <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                        </div>
                        <div className="flex-1 h-4 bg-white/5 rounded-md mx-2" />
                      </div>

                      {/* Mock navbar skeleton */}
                      <div className="flex items-center justify-between bg-white/4 border border-white/6 rounded-xl px-4 py-3">
                        <div className="w-20 h-3 bg-white/10 rounded-full" />
                        <div className="flex gap-3">
                          <div className="w-10 h-2.5 bg-white/8 rounded-full" />
                          <div className="w-10 h-2.5 bg-white/8 rounded-full" />
                          <div className="w-10 h-2.5 bg-white/8 rounded-full" />
                        </div>
                        <div className="w-16 h-6 bg-primary/20 border border-primary/20 rounded-lg" />
                      </div>

                      {/* Mock hero skeleton */}
                      <div className="flex-1 bg-white/3 border border-white/6 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                        <div className="w-48 h-4 bg-white/10 rounded-full" />
                        <div className="w-64 h-3 bg-white/6 rounded-full" />
                        <div className="w-40 h-3 bg-white/6 rounded-full" />
                        <div className="flex gap-2 mt-2">
                          <div className="w-24 h-7 bg-primary/25 border border-primary/20 rounded-lg" />
                          <div className="w-24 h-7 bg-white/6 border border-white/8 rounded-lg" />
                        </div>
                      </div>

                      {/* Mock cards row */}
                      <div className="flex gap-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex-1 bg-white/3 border border-white/6 rounded-xl p-3 space-y-2">
                            <div className="w-6 h-6 bg-primary/20 rounded-lg" />
                            <div className="w-full h-2.5 bg-white/8 rounded-full" />
                            <div className="w-3/4 h-2 bg-white/5 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Center overlay message */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                      <div className="bg-background/60 backdrop-blur-md border border-border rounded-2xl px-6 py-5 text-center space-y-2 shadow-xl">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Tu interfaz aparecerá aquí</p>
                        <p className="text-xs text-muted-foreground">Describe lo que quieres construir en el chat</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="code" className="h-full mt-0">
              {uiData?.files?.length ? (
                <div className="h-full flex">
                  {/* File tree */}
                  <div className="w-52 flex-shrink-0 bg-[#161616] border-r border-white/8 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10">
                    <div className="px-3 py-2 border-b border-white/8">
                      <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Archivos</span>
                    </div>
                    {(() => {
                      // Group files by folder
                      const groups: Record<string, { path: string; name: string }[]> = {};
                      for (const f of uiData.files) {
                        const parts = f.path.replace(/^\//, '').split('/');
                        const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
                        const name = parts[parts.length - 1];
                        if (!groups[folder]) groups[folder] = [];
                        groups[folder].push({ path: f.path, name });
                      }
                      return Object.entries(groups).map(([folder, files]) => (
                        <div key={folder}>
                          {folder && (
                            <div className="px-3 pt-2 pb-0.5">
                              <span className="text-[10px] text-white/25 font-mono">{folder}/</span>
                            </div>
                          )}
                          {files.map(file => (
                            <button
                              key={file.path}
                              onClick={() => setSelectedFilePath(file.path)}
                              className={`w-full text-left px-4 py-1.5 text-xs font-mono truncate transition-colors ${
                                selectedFilePath === file.path
                                  ? 'bg-white/10 text-cyan-400'
                                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                              }`}
                            >
                              {file.name}
                            </button>
                          ))}
                        </div>
                      ));
                    })()}
                  </div>

                  {/* File content — Monaco read-only */}
                  <div className="flex-1 h-full">
                    {selectedFilePath && (() => {
                      const file = uiData.files.find(f => f.path === selectedFilePath);
                      return file ? (
                        <MonacoEditor
                          filePath={file.path}
                          code={file.content}
                          onChange={() => {}}
                          readOnly
                        />
                      ) : null;
                    })()}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-muted-foreground bg-[#1e1e1e] p-8">
                  <Code2 className="w-16 h-16 opacity-20" />
                  <div>
                    <p className="font-medium text-foreground">Sin código</p>
                    <p className="text-sm mt-1">El código generado aparecerá aquí</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </div>

    {/* Publish dialog */}

    {/* Diálogo exportar ZIP */}
    <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Exportar proyecto</DialogTitle>
          <DialogDescription>Elige un nombre para el archivo ZIP.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre del proyecto</label>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExport()}
              placeholder="mi-proyecto"
              autoFocus
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Descargar ZIP
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setExportDialogOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={publishOpen} onOpenChange={(v) => { if (!v) { setPublishOpen(false); setPublishName(""); setPublishDescription(""); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Publicar proyecto</DialogTitle>
          <DialogDescription>
            Dale un nombre y descripción antes de compartirlo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nombre del proyecto</label>
            <input
              type="text"
              value={publishName}
              onChange={e => setPublishName(e.target.value)}
              placeholder={`Proyecto ${new Date().toLocaleDateString("es")}`}
              className="w-full px-3 py-2 text-sm bg-secondary/40 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Descripción <span className="text-muted-foreground/50">(opcional)</span></label>
            <textarea
              value={publishDescription}
              onChange={e => setPublishDescription(e.target.value)}
              placeholder="¿Qué hace este proyecto?"
              rows={2}
              className="w-full px-3 py-2 text-sm bg-secondary/40 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50 resize-none"
            />
          </div>
        </div>

        <div className={`grid gap-3 pt-1 ${isAdmin ? "grid-cols-2" : "grid-cols-1"}`}>
          {isAdmin && (
            <button
              disabled={publishing}
              onClick={() => handlePublish("template")}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-violet-500/50 transition-all p-5 disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-violet-500/15 flex items-center justify-center">
                <Upload className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Plantilla</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Otros usuarios pueden usarlo como base</p>
              </div>
            </button>
          )}

          <button
            disabled={publishing}
            onClick={() => handlePublish("community")}
            className="relative flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-blue-500/50 transition-all p-5 disabled:opacity-50"
          >
            {!canPublish && (
              <span className="absolute top-2 right-2 text-[10px] font-semibold bg-violet-600/80 text-white px-1.5 py-0.5 rounded-full">Pro</span>
            )}
            <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Comunidad</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Comparte tu proyecto con la comunidad</p>
            </div>
          </button>
        </div>

        {publishing && (
          <p className="text-center text-xs text-muted-foreground pt-1">Publicando...</p>
        )}
      </DialogContent>
    </Dialog>

    {/* Connect GitHub dialog */}
    <Dialog open={githubDialogOpen} onOpenChange={setGithubDialogOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Conectar GitHub
          </DialogTitle>
          <DialogDescription>
            Para subir proyectos a GitHub necesitas conectar tu cuenta. Es rápido y solo se hace una vez.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleConnectGitHub}
            className="flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all px-5 py-4"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm font-medium">Conectar con GitHub</span>
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Solo pedimos el permiso <code className="bg-secondary px-1 rounded">public_repo</code> para crear repositorios públicos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
