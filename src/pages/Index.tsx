import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Zap, Code2, Sparkles, Shield, Users, ArrowRight,
  Upload, Heart, Eye, Bookmark, Globe, CheckCircle2, Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { UploadProjectModal } from "@/components/UploadProjectModal";
import { ViewProjectModal } from "@/components/ViewProjectModal";
import { useState, useEffect } from "react";
import { apiService } from "@/service/ApiService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Project = {
  name: string;
  author?: string;
  description: string;
  likes?: number;
  views?: number;
  image?: string;
  url?: string;
};

interface ApiPostRaw {
  id: string;
  title: string;
  content: string;
  author: { username: string };
  likes_count: number;
  views_count?: number;
  attachments?: string[];
}

interface ApiResponse {
  data: ApiPostRaw[];
}

interface PublicTemplate {
  id: string;
  name: string;
  description?: string;
  settings?: { framework?: string; thumbnail?: string };
  owner_username?: string;
  likes_count?: number;
}

const FW_GRADIENT: Record<string, string> = {
  react:   "from-cyan-500/20 to-blue-500/10",
  vue:     "from-green-500/20 to-emerald-500/10",
  nextjs:  "from-gray-500/20 to-zinc-500/10",
  vanilla: "from-yellow-500/20 to-amber-500/10",
};

function CommunityShowcase() {
  const [templates, setTemplates] = useState<PublicTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    apiService.get<{ data: PublicTemplate[] }>("/projects/public?type=template&limit=6")
      .then((res) => setTemplates(res.data || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      await apiService.delete(`/admin/templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Plantilla eliminada", description: `"${name}" eliminada correctamente.` });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "No se pudo eliminar.", variant: "destructive" });
    } finally {
      setDeletingId(null);
      setConfirmTarget(null);
    }
  };

  if (!loading && templates.length === 0) return null;

  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20 px-3 py-1">
            <Bookmark className="w-3.5 h-3.5 mr-1.5" />
            Plantillas de la comunidad
          </Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            Empieza desde una base real
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Proyectos publicados por la comunidad que puedes usar como punto de partida
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card animate-pulse">
                <div className="h-36 rounded-t-xl bg-secondary" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-secondary rounded w-2/3" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {templates.map((tpl) => {
              const fw = tpl.settings?.framework ?? "vanilla";
              const gradient = FW_GRADIENT[fw] ?? FW_GRADIENT.vanilla;
              return (
                <Card
                  key={tpl.id}
                  className="bg-card border-border hover:border-violet-500/50 transition-all duration-300 group overflow-hidden hover:shadow-lg hover:shadow-violet-500/10"
                >
                  <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                    {tpl.settings?.thumbnail ? (
                      <img
                        src={tpl.settings.thumbnail}
                        alt={tpl.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-60">
                        <Bookmark className="w-8 h-8 text-violet-400" />
                        <span className="text-xs text-white/50 font-medium px-4 text-center line-clamp-2">{tpl.name}</span>
                      </div>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setConfirmTarget({ id: tpl.id, name: tpl.name })}
                        disabled={deletingId === tpl.id}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 hover:bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
                        title="Eliminar plantilla"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{tpl.name}</CardTitle>
                    <CardDescription>
                      {tpl.description || "Sin descripción"} · por {tpl.owner_username ?? "anónimo"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2" asChild>
                      <Link to={`/ai-chat?fork=${tpl.id}`}>
                        Usar plantilla
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link to="/community">
              <Globe className="w-4 h-4" />
              Ver todas en comunidad
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Dialog open={!!confirmTarget} onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}>
        <DialogContent className="max-w-sm bg-[#1a1a1f] border border-white/10 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <DialogTitle className="text-white text-base">Eliminar plantilla</DialogTitle>
            </div>
            <DialogDescription className="text-white/50 text-sm leading-relaxed">
              ¿Estás seguro de que quieres eliminar{" "}
              <span className="text-white/80 font-medium">"{confirmTarget?.name}"</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/5"
              onClick={() => setConfirmTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!!deletingId}
              onClick={() => confirmTarget && handleDelete(confirmTarget.id, confirmTarget.name)}
            >
              {deletingId ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Describe tu idea",
    description: "Escribe en lenguaje natural lo que quieres construir. Sin tecnicismos.",
  },
  {
    number: "02",
    title: "La IA genera el código",
    description: "Nuestro motor de IA avanzado construye la estructura, componentes y lógica.",
  },
  {
    number: "03",
    title: "Personaliza y publica",
    description: "Refina con el editor en vivo y comparte tu aplicación con el mundo.",
  },
];

const Index = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewProjectModalOpen, setViewProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [communityProjects, setCommunityProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    apiService.get<ApiResponse>('/community/posts')
      .then((res) => {
        const mapped: Project[] = (res.data || []).map((p) => ({
          name: p.title,
          author: p.author?.username,
          description: p.content,
          likes: p.likes_count,
          views: p.views_count,
          image: "🚀",
          url: p.attachments?.[0],
        }));
        setCommunityProjects(mapped);
      })
      .catch(() => setCommunityProjects([]))
      .finally(() => setLoadingProjects(false));
  }, []);

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setViewProjectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main>
        {/* ── Hero ── */}
        <section className="relative pt-32 pb-24 px-4 flex flex-col items-center text-center overflow-hidden">
          {/* Background glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/15 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 container mx-auto max-w-5xl animate-fade-in">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Ahora con Generación de Código IA
            </Badge>

            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-cyan-400 bg-clip-text text-transparent">
                Construye Aplicaciones
              </span>
              <br />
              <span className="text-foreground">a la Velocidad del Pensamiento</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Transforma tus ideas en aplicaciones listas para producción con herramientas de desarrollo potenciadas por IA.
              Sin complejidad, solo resultados.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg h-14 px-10 shadow-lg shadow-primary/25">
                <Link to="/register">
                  Comienza Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-14 px-10 border-border hover:border-primary/50">
                <Link to="/dashboard">
                  Ver Demo
                </Link>
              </Button>
            </div>

          </div>

          {/* Terminal demo */}
          <div className="relative z-10 container mx-auto max-w-4xl mt-20">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-cyan-500/20 to-primary/20 rounded-2xl blur-sm" />
              <Card className="relative bg-card/80 border-border backdrop-blur-sm overflow-hidden rounded-2xl">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/30">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">orion ~ terminal</span>
                </div>
                <div className="p-6 font-mono text-sm space-y-3">
                  <p>
                    <span className="text-primary">❯</span>
                    <span className="text-muted-foreground ml-2">orion generate </span>
                    <span className="text-cyan-400">"modern dashboard with analytics"</span>
                  </p>
                  <div className="space-y-1.5 pl-4 border-l-2 border-border">
                    <p className="text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Creando estructura del proyecto...
                    </p>
                    <p className="text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Generando componentes UI...
                    </p>
                    <p className="text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Optimizando rendimiento...
                    </p>
                    <p className="text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Configurando rutas y estado...
                    </p>
                  </div>
                  <p className="text-primary font-semibold">✨ ¡Tu proyecto está listo en 4.2s!</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section className="py-24 px-4 bg-secondary/10 border-y border-border">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1">
                Proceso simple
              </Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
                De la idea al producto en 3 pasos
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Sin curva de aprendizaje. Sin configuración tediosa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line (desktop only) */}
              <div className="hidden md:block absolute top-8 left-[calc(16.666%+1rem)] right-[calc(16.666%+1rem)] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center text-center group">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300">
                      <span className="text-2xl font-heading font-bold text-primary">{step.number}</span>
                    </div>
                    <div className="absolute -inset-1 bg-primary/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features bento ── */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
                Todo lo que necesitas
                <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent"> para construir más rápido</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Herramientas profesionales diseñadas para flujos de trabajo de desarrollo moderno
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* Feature grande: Generación IA */}
              <Card className="lg:col-span-2 bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Generación con IA</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Describe tu idea en lenguaje natural y nuestro motor de IA avanzado genera el código completo:
                    componentes, rutas, estado, estilos y más. Lista para producción desde el primer minuto.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="sm" asChild className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40">
                    <Link to="/register">
                      Probar ahora <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Editor en Vivo */}
              <Card className="bg-card border-border hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Code2 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <CardTitle className="text-lg">Editor en Vivo</CardTitle>
                  <CardDescription>
                    Edición en tiempo real con Monaco Editor y vista previa instantánea sin recargar.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Ultra Rápido */}
              <Card className="bg-card border-border hover:border-yellow-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <CardTitle className="text-lg">Ultra Rápido</CardTitle>
                  <CardDescription>
                    Genera y despliega tus aplicaciones en segundos. Más tiempo creando, menos configurando.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Seguridad Empresarial */}
              <Card className="bg-card border-border hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Seguridad Empresarial</CardTitle>
                  <CardDescription>
                    Seguridad de nivel bancario para tus proyectos y datos. Cifrado end-to-end incluido.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Colaboración */}
              <Card className="bg-card border-border hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">Colaboración en Equipo</CardTitle>
                  <CardDescription>
                    Trabaja junto a tu equipo de forma fluida. Proyectos compartidos en tiempo real.
                  </CardDescription>
                </CardHeader>
              </Card>

            </div>
          </div>
        </section>

        {/* ── Plantillas comunidad ── */}
        <CommunityShowcase />

        {/* ── CTA ── */}
        <section className="py-28 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-cyan-500/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto max-w-3xl relative z-10 text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-3 py-1">
              Empieza hoy, gratis
            </Badge>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-5 leading-tight">
              ¿Listo para construir
              <br />
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                algo increíble?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Únete a miles de desarrolladores que ya están construyendo el futuro con IA. Sin tarjeta de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg h-14 px-10 shadow-lg shadow-primary/30">
                <Link to="/register">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-14 px-10 hover:border-primary/50">
                <Link to="/pricing">
                  Ver Planes
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Proyectos de la comunidad ── */}
        <section className="py-24 px-4 bg-secondary/10 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 px-3 py-1">
                  🌟 Comunidad
                </Badge>
                <h2 className="text-3xl md:text-4xl font-heading font-bold">
                  Creado por la comunidad
                </h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Explora proyectos increíbles construidos con Orion Builder
                </p>
              </div>
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 shrink-0"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir mi proyecto
              </Button>
            </div>

            {loadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card animate-pulse">
                    <div className="h-40 rounded-t-xl bg-secondary" />
                    <div className="p-5 space-y-2">
                      <div className="h-4 bg-secondary rounded w-2/3" />
                      <div className="h-3 bg-secondary rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : communityProjects.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground space-y-3 border border-dashed border-border rounded-2xl">
                <p className="text-4xl">🚀</p>
                <p className="text-lg font-medium text-foreground">Aún no hay proyectos publicados</p>
                <p className="text-sm">¡Sé el primero en compartir tu proyecto con la comunidad!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityProjects.map((project, idx) => (
                  <Card
                    key={idx}
                    className="bg-card border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer group overflow-hidden"
                  >
                    <div className="h-44 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                      {project.image}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {project.author && (
                        <CardDescription className="text-xs">
                          por {project.author}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-red-400" /> {project.likes ?? 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> {project.views ?? 0} vistas
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full hover:border-primary/50 hover:text-primary"
                        size="sm"
                        onClick={() => handleViewProject(project)}
                      >
                        Ver Proyecto
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild className="gap-2 hover:border-primary/50">
                <Link to="/community">
                  Ver todos los proyectos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <UploadProjectModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />

      <ViewProjectModal
        open={viewProjectModalOpen}
        onOpenChange={setViewProjectModalOpen}
        project={selectedProject || { name: "", description: "" }}
      />
    </div>
  );
};

export default Index;
