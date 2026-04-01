import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChat, Message, WcStatus } from "@/hooks/useChat";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { dumpFsToJson } from "@/editor/fileSystem/lightningFsAdapter";
import ReactMarkdown from "react-markdown";
import type { UIComponentData } from "@/service/AiService";

// ─── Design card shown for ui_component AI responses ────────────────────────
function DesignCard({ data }: { data: UIComponentData }) {
  return (
    <div className="bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border border-blue-500/40 rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-blue-100">Interfaz generada</h3>
          <p className="text-xs text-gray-400 mt-0.5">{data.designInfo?.layout || "Componente React"}</p>
        </div>
      </div>

      <div className="px-5 pb-5 border-t border-blue-500/20 pt-4 space-y-4">
        {/* AI description of what was built */}
        {data.description && (
          <p className="text-sm text-gray-300 leading-relaxed">{data.description}</p>
        )}

        {/* Color palette */}
        {data.designInfo?.colors && Object.keys(data.designInfo.colors).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-blue-200 mb-2">Paleta</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.designInfo.colors).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded border border-white/20"
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-xs text-gray-400 capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Effects */}
        {data.designInfo?.effects?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-blue-200 mb-2">Efectos</p>
            <div className="flex flex-wrap gap-1.5">
              {data.designInfo.effects.slice(0, 4).map((e, i) => (
                <Badge key={i} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                  {e}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Components */}
        {data.designInfo?.components?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-blue-200 mb-2">Componentes</p>
            <div className="flex flex-wrap gap-1.5">
              {data.designInfo.components.map((c, i) => (
                <Badge key={i} className="bg-gray-700/50 text-gray-300 border-gray-600 text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        )}
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
    wcError,
    uiData,
    sendMessage,
    sendFullProjectRequest,
    clearChat,
  } = useChat();

  const navigate = useNavigate();
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

  // Show skeleton from the moment user sends until Vite URL is ready
  const showSkeleton = (sending || previewHtml || wcStatus !== 'idle') && !previewUrl;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 ml-64 pt-16">
          <div className="flex h-[calc(100vh-4rem)]">

            {/* ── Left: Chat ─────────────────────────────────────────── */}
            <div className="w-2/5 border-r border-border flex flex-col bg-card">
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-heading font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Builder
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Describe tu proyecto y lo generamos en tiempo real
                  </p>
                </div>
                {messages.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearChat} title="Limpiar chat">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.length === 0 && !sending && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="font-heading font-semibold text-lg">¿Qué quieres construir?</h2>
                    <p className="text-sm text-muted-foreground">
                      Describe una interfaz, componente o proyecto y lo generaré automáticamente con preview en vivo.
                    </p>
                    <div className="flex flex-col gap-2 w-full mt-2">
                      {[
                        'Crea un dashboard con gráficas de ventas',
                        'Diseña un formulario de login moderno',
                        'Genera una landing page para una app SaaS',
                      ].map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => { setMessage(suggestion); textareaRef.current?.focus(); }}
                          className="text-left text-xs px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <ChatBubble key={idx} message={msg} />
                ))}

                {/* Live streaming bubble — always shows friendly state, never raw JSON */}
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
              <div className="p-4 border-t border-border space-y-2">
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ej: 'Crea un dashboard con gráficas de ventas y modo oscuro'"
                    className="min-h-[80px] bg-background border-border resize-none text-sm"
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSend}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 h-[80px] px-5"
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

            {/* ── Right: Preview / Code ──────────────────────────────── */}
            <div className="flex-1 flex flex-col bg-background">
              {/* Toolbar */}
              <div className="border-b border-border p-3 flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                  <TabsList>
                    <TabsTrigger value="preview" className="gap-2 text-xs">
                      <Eye className="w-3.5 h-3.5" />
                      Vista Previa
                      {wcStatus === 'ready' && (
                        <span className="ml-1 w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" title="Vite corriendo" />
                      )}
                      {showSkeleton && (
                        <span className="ml-1 w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse" title="Construyendo..." />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="code" className="gap-2 text-xs">
                      <Code2 className="w-3.5 h-3.5" />
                      Código
                      {generatedCode && (
                        <span className="ml-1 w-2 h-2 rounded-full bg-blue-500 inline-block" title="Código listo" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                  {/* Device switcher */}
                  <div className="flex gap-1 p-1 bg-secondary rounded-lg">
                    {([
                      { key: 'desktop', icon: Monitor },
                      { key: 'tablet', icon: Tablet },
                      { key: 'mobile', icon: Smartphone },
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
                  {previewUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="text-xs h-7 border-green-500/50 text-green-400 hover:bg-green-500/10"
                      title="Abrir preview en nueva pestaña"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Nueva pestaña
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => navigate('/editor')}
                    disabled={!generatedCode}
                    className="bg-primary hover:bg-primary/90 text-xs h-7"
                  >
                    <Code2 className="w-3 h-3 mr-1" />
                    Abrir Editor
                  </Button>
                </div>
              </div>

              {/* Panel content */}
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} className="h-full">
                  {/* ── Preview tab ────────────────────────────────── */}
                  <TabsContent value="preview" className="h-full mt-0 p-0 flex flex-col">
                    {/* Build progress bar (only while WC is booting) */}
                    {wcStatus !== 'idle' && wcStatus !== 'ready' && (
                      <BuildProgressBar status={wcStatus} />
                    )}
                    {/* Ready status strip */}
                    {wcStatus === 'ready' && (
                      <div className="border-b border-green-500/20 bg-green-500/5 px-4 py-1.5 flex items-center gap-2 text-xs text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Vite corriendo — preview en vivo
                      </div>
                    )}

                    {/* Preview frame */}
                    <div className="flex-1 overflow-hidden relative">
                      {previewUrl ? (
                        // Real Vite dev server — fade in when ready
                        <div className="h-full flex items-start justify-center overflow-auto bg-muted/20 p-4 animate-in fade-in duration-500">
                          <div
                            className={`${deviceClass} bg-white rounded-lg border border-green-500/40 shadow-2xl overflow-hidden transition-all duration-300`}
                            style={{ minHeight: device === 'desktop' ? '100%' : undefined }}
                          >
                            <iframe
                              src={previewUrl}
                              className="w-full h-full border-0"
                              title="Vista Previa — Vite"
                              style={{ minHeight: device === 'desktop' ? 'calc(100vh - 10rem)' : undefined }}
                            />
                          </div>
                        </div>
                      ) : showSkeleton ? (
                        // Animated skeleton while WC boots (replaces Babel preview)
                        <PreviewLoadingSkeleton />
                      ) : sending && streamingContent ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                          <div className="flex gap-2">
                            <span className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                          <p className="text-sm">Generando preview...</p>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-muted-foreground p-8">
                          <Eye className="w-16 h-16 opacity-20" />
                          <div>
                            <p className="font-medium text-foreground">Sin preview</p>
                            <p className="text-sm mt-1">El preview aparecerá automáticamente cuando la IA genere una interfaz</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* ── Code tab ──────────────────────────────────── */}
                  <TabsContent value="code" className="h-full mt-0">
                    <div className="h-full bg-[#1e1e1e] overflow-auto">
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

              {/* Status bar */}
              {uiData && (
                <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground bg-card">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${wcStatus === 'ready' && !wcError ? 'bg-green-500 animate-pulse' : wcError ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`} />
                    <span>
                      {uiData.files?.length ?? 0} archivos · {uiData.designInfo?.components?.length ?? 0} componentes
                    </span>
                  </div>
                  {wcError && sending && (
                    <span className="text-yellow-400 font-medium flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                      Corrigiendo error automáticamente...
                    </span>
                  )}
                  {wcError && !sending && (
                    <span className="text-red-400 truncate max-w-xs" title={wcError}>
                      ⚠️ {wcError.split('\n')[0].slice(0, 60)}...
                    </span>
                  )}
                  {!wcError && wcStatus === 'ready' && (
                    <span className="text-green-400 font-medium">⚡ Vite corriendo</span>
                  )}
                  {wcStatus === 'error' && !wcError && (
                    <span className="text-red-400">WebContainer error — usando Babel preview</span>
                  )}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
