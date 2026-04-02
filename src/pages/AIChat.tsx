import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Sparkles,
  Code2,
  Eye,
  Download,
  Copy,
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  ExternalLink,
  Zap,
  Package,
  Server,
  CheckCircle2,
  Rocket,
  Upload,
  Home,
  MessageSquare,
  FolderOpen,
  Settings,
  ChevronRight,
} from "lucide-react";
import { authService } from "@/service/AuthService";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChat, Message, WcStatus } from "@/hooks/useChat";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { dumpFsToJson } from "@/editor/fileSystem/lightningFsAdapter";
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

// ─── Build progress bar ──────────────────────────────────────────────────────
const BUILD_STEPS: { status: WcStatus; label: string; icon: React.ElementType; pct: number }[] = [
  { status: 'booting',    label: 'Iniciando entorno',   icon: Zap,          pct: 20 },
  { status: 'installing', label: 'Instalando paquetes', icon: Package,      pct: 55 },
  { status: 'starting',   label: 'Arrancando servidor', icon: Server,       pct: 80 },
  { status: 'ready',      label: 'Listo',               icon: CheckCircle2, pct: 100 },
];

const STATUS_PCT: Partial<Record<WcStatus, number>> = {
  booting: 20, installing: 55, starting: 80, ready: 100,
};

function BuildProgressBar({ status }: { status: WcStatus }) {
  if (status === 'idle') return null;

  const pct = STATUS_PCT[status] ?? 0;
  const currentStepIdx = BUILD_STEPS.findIndex(s => s.status === status);

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur px-4 py-3 space-y-2">
      {/* Step labels */}
      <div className="flex items-center justify-between">
        {BUILD_STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const done = currentStepIdx > idx;
          const active = currentStepIdx === idx;
          return (
            <div key={step.status} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                  done    ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                  active  ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px] shadow-primary/30' :
                            'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {active && status !== 'ready' ? (
                  <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  <StepIcon className="w-3.5 h-3.5" />
                )}
              </div>
              <span className={`text-[10px] text-center leading-tight ${
                done ? 'text-green-400' : active ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress track */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {status === 'error' && (
        <p className="text-xs text-red-400 text-center">Error al iniciar el entorno — usando preview rápido</p>
      )}
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

// ─── Lovable-style generation progress ───────────────────────────────────────
const GEN_STEPS = [
  { label: 'Analizando tu solicitud', seconds: 2 },
  { label: 'Diseñando la interfaz',   seconds: 5 },
  { label: 'Generando componentes',   seconds: 9 },
  { label: 'Preparando el preview',   seconds: 999 },
];

function GenerationProgress({ streamingContent }: { streamingContent: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const stepIdx = GEN_STEPS.findIndex((_, i) => {
    const cumulative = GEN_STEPS.slice(0, i + 1).reduce((a, s) => a + s.seconds, 0);
    return elapsed < cumulative;
  });
  const currentStep = stepIdx === -1 ? GEN_STEPS.length - 1 : stepIdx;

  // Pull last meaningful line from stream (skip JSON/empty lines)
  const currentAction = streamingContent
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('{') && !l.startsWith('[') && l.length > 8)
    .slice(-1)[0]
    ?.slice(0, 65);

  return (
    <div className="h-full bg-[#0d0d14] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-xs space-y-4">
        {/* Timer */}
        <div className="flex items-center gap-2 text-xs text-white/40">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-primary/60 border-t-primary animate-spin" />
          <span>Pensando por {elapsed}s</span>
        </div>

        {/* Current action */}
        {currentAction && (
          <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/60">Editando componentes</span>
              <ChevronRight className="w-3 h-3 text-white/25" />
            </div>
            <p className="text-xs text-white/35 truncate">{currentAction}</p>
          </div>
        )}

        {/* Steps list */}
        <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
          {GEN_STEPS.map((step, i) => {
            const done   = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={step.label} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                ) : active ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" />
                )}
                <span className={`text-xs ${done ? 'text-green-400' : active ? 'text-white/80 font-medium' : 'text-white/25'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    sending,
    streamingContent,
    generatedCode,
    previewHtml,
    previewUrl,
    wcStatus,
    sendMessage,
    sendFullProjectRequest,
    clearChat,
  } = useChat();

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Auto-switch to preview tab when previewHtml arrives
  useEffect(() => {
    if (previewHtml) setActiveTab('preview');
  }, [previewHtml]);

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

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast({ title: 'Copiado', description: 'Código copiado al portapapeles' });
  };

  const handleExport = async () => {
    try {
      const allFiles = await dumpFsToJson();
      const blob = new Blob([JSON.stringify(allFiles, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orion-project.json';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Exportado', description: `${Object.keys(allFiles).length} archivos exportados` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo exportar', variant: 'destructive' });
    }
  };

  const deviceClass = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-[1024px] mx-auto',
    mobile: 'w-[375px] h-[667px] mx-auto',
  }[device];

  // Show WC booting skeleton after generation (not while AI is generating)
  const showSkeleton = !sending && (previewHtml !== '' || wcStatus !== 'idle') && !previewUrl;

  const NAV_ITEMS = [
    { to: '/dashboard',  icon: Home,          label: 'Dashboard' },
    { to: '/ai-chat',    icon: MessageSquare, label: 'AI Chat' },
    { to: '/editor',     icon: Code2,         label: 'Editor' },
    { to: '/projects',   icon: FolderOpen,    label: 'Proyectos' },
    { to: '/settings',   icon: Settings,      label: 'Ajustes' },
  ];

  return (
    <div className="h-screen bg-background flex overflow-hidden">

      {/* ── Icon sidebar ─────────────────────────────────────────── */}
      <aside className="w-14 flex-shrink-0 flex flex-col items-center py-3 border-r border-border bg-card">
        <Link
          to="/"
          className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-5 hover:bg-primary/20 transition-colors"
          title="Inicio"
        >
          <Rocket className="w-4 h-4 text-primary" />
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              title={label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                location.pathname === to
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
            </Link>
          ))}
        </nav>

        {/* User avatar */}
        {(() => {
          const user = authService.getUser();
          const initials = (user?.username ?? user?.email ?? '?').slice(0, 2).toUpperCase();
          return (
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/40 to-violet-500/40 border border-primary/30 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity mb-1"
              title={user?.username ?? user?.email ?? 'Usuario'}
              onClick={() => navigate('/settings')}
            >
              {user?.avatar
                ? <img src={user.avatar} alt={initials} className="w-full h-full rounded-xl object-cover" />
                : initials}
            </div>
          );
        })()}

        <Button
          size="sm"
          onClick={() => navigate('/projects')}
          className="w-9 h-9 p-0 bg-primary hover:bg-primary/90"
          title="Publicar"
        >
          <Upload className="w-4 h-4" />
        </Button>
      </aside>

      {/* ── Left: Chat ───────────────────────────────────────────── */}
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

      {/* ── Right: Preview / Code ────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        {/* Toolbar */}
        <div className="border-b border-border px-3 py-2 flex items-center justify-between flex-shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="preview" className="gap-2 text-xs">
                <Eye className="w-3.5 h-3.5" />
                Vista Previa
                {wcStatus === 'ready' && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                )}
                {showSkeleton && (
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

            <Button variant="outline" size="sm" onClick={handleCopyCode} disabled={!generatedCode} className="text-xs h-7">
              <Copy className="w-3 h-3 mr-1" />
              Copiar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="text-xs h-7">
              <Download className="w-3 h-3 mr-1" />
              Exportar
            </Button>
            {(previewUrl || previewHtml) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (previewHtml) {
                    const blob = new Blob([previewHtml], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  } else {
                    window.open(previewUrl, '_blank');
                  }
                }}
                className="text-xs h-7 border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Nueva pestaña
              </Button>
            )}
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
            <Button
              size="sm"
              onClick={() => navigate('/projects')}
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
                  <div className="h-full flex items-start justify-center overflow-auto bg-muted/20 p-4 animate-in fade-in duration-500 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div
                      className={`${deviceClass} bg-white rounded-lg border border-border shadow-2xl overflow-hidden transition-all duration-300`}
                      style={{ minHeight: device === 'desktop' ? '100%' : undefined }}
                    >
                      <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="Vista Previa — Vite"
                        style={{ minHeight: device === 'desktop' ? '100%' : undefined }}
                      />
                    </div>
                  </div>
                ) : sending ? (
                  <GenerationProgress streamingContent={streamingContent} />
                ) : showSkeleton ? (
                  <PreviewLoadingSkeleton />
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
              <div className="h-full bg-[#1e1e1e] overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                {generatedCode ? (
                  <SyntaxHighlighter
                    language="tsx"
                    style={vscDarkPlus}
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      background: '#1e1e1e',
                      fontSize: '0.8125rem',
                      minHeight: '100%',
                    }}
                  >
                    {generatedCode}
                  </SyntaxHighlighter>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-muted-foreground p-8">
                    <Code2 className="w-16 h-16 opacity-20" />
                    <div>
                      <p className="font-medium text-foreground">Sin código</p>
                      <p className="text-sm mt-1">El código generado aparecerá aquí en tiempo real</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </div>
  );
}
