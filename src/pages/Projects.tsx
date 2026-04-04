import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, FolderX, MoreHorizontal, ExternalLink, Globe, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { apiService } from "@/service/ApiService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { IconSidebar } from "@/components/layout/IconSidebar";

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  settings?: { framework?: string; language?: string; thumbnail?: string };
  owner_username?: string;
  owner_avatar?: string;
}

interface ApiResponse {
  data: Project[];
}

function editedLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `Edited ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

const FRAMEWORK_THEME: Record<string, { from: string; to: string; accent: string }> = {
  react:    { from: "#0f2044", to: "#0c1a30", accent: "#61dafb" },
  vue:      { from: "#0a2818", to: "#071d11", accent: "#42d392" },
  angular:  { from: "#2a0a0a", to: "#1a0606", accent: "#dd1b16" },
  vanilla:  { from: "#1a1a2e", to: "#0f0f1e", accent: "#f7df1e" },
  nextjs:   { from: "#0a0a0a", to: "#111111", accent: "#ffffff" },
};

function ProjectMockup({ project }: { project: Project }) {
  const fw = project.settings?.framework ?? "vanilla";
  const theme = FRAMEWORK_THEME[fw] ?? FRAMEWORK_THEME.vanilla;
  const initials = project.name.slice(0, 2).toUpperCase();

  if (project.settings?.thumbnail) {
    return <img src={project.settings.thumbnail} alt={project.name} className="w-full h-full object-cover" />;
  }

  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`g${project.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.from} />
          <stop offset="100%" stopColor={theme.to} />
        </linearGradient>
      </defs>
      <rect width="480" height="300" fill={`url(#g${project.id})`} />
      {/* nav bar */}
      <rect x="0" y="0" width="480" height="36" fill="rgba(255,255,255,0.04)" />
      <rect x="14" y="11" width="48" height="14" rx="3" fill={theme.accent} opacity="0.7" />
      <rect x="180" y="13" width="30" height="10" rx="2" fill="rgba(255,255,255,0.15)" />
      <rect x="218" y="13" width="30" height="10" rx="2" fill="rgba(255,255,255,0.15)" />
      <rect x="256" y="13" width="30" height="10" rx="2" fill="rgba(255,255,255,0.15)" />
      <rect x="408" y="11" width="58" height="14" rx="4" fill={theme.accent} opacity="0.8" />
      {/* hero */}
      <rect x="130" y="58" width="220" height="18" rx="4" fill="rgba(255,255,255,0.85)" />
      <rect x="150" y="84" width="180" height="12" rx="3" fill="rgba(255,255,255,0.45)" />
      <rect x="166" y="104" width="148" height="9" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="166" y="124" width="64" height="18" rx="4" fill={theme.accent} opacity="0.9" />
      <rect x="238" y="124" width="76" height="18" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* cards */}
      <rect x="16" y="160" width="136" height="80" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="172" y="160" width="136" height="80" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="328" y="160" width="136" height="80" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <rect x="26" y="170" width="40" height="8" rx="2" fill={theme.accent} opacity="0.6" />
      <rect x="26" y="184" width="110" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="26" y="194" width="90" height="5" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="182" y="170" width="40" height="8" rx="2" fill={theme.accent} opacity="0.6" />
      <rect x="182" y="184" width="110" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="182" y="194" width="90" height="5" rx="2" fill="rgba(255,255,255,0.12)" />
      <rect x="338" y="170" width="40" height="8" rx="2" fill={theme.accent} opacity="0.6" />
      <rect x="338" y="184" width="110" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="338" y="194" width="90" height="5" rx="2" fill="rgba(255,255,255,0.12)" />
      {/* watermark initials */}
      <text x="420" y="280" fontFamily="monospace" fontSize="48" fill={theme.accent} opacity="0.06" fontWeight="bold">{initials}</text>
    </svg>
  );
}

function ProjectCard({ project, onDelete, onPublish, onClick }: {
  project: Project;
  onDelete: (id: string, name: string) => void;
  onPublish: (project: Project) => void;
  onClick: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const avatar = project.owner_avatar;
  const username = project.owner_username ?? "me";

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden border border-white/8 bg-[#1a1a1f] hover:border-white/20 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-black/40"
      onClick={() => onClick(project.id)}
    >
      {/* thumbnail */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#0d0d12]">
        <ProjectMockup project={project} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2 text-white text-sm font-medium">
            <ExternalLink className="w-4 h-4" />
            Abrir en editor
          </div>
        </div>
      </div>

      {/* bottom strip */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#111116]">
        <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-xs font-bold text-white select-none">
          {avatar
            ? <img src={avatar} alt={username} className="w-full h-full object-cover" />
            : username.slice(0, 1).toUpperCase()
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate leading-tight">{project.name}</p>
          <p className="text-xs text-white/40 leading-tight mt-0.5">{editedLabel(project.updated_at)}</p>
        </div>

        {/* kebab menu */}
        <div ref={menuRef} className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 bottom-9 w-48 rounded-lg border border-white/10 bg-[#1e1e28] shadow-xl z-50 overflow-hidden">
              <button
                className="w-full px-3 py-2 text-sm text-left text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                onClick={() => { setMenuOpen(false); onPublish(project); }}
              >
                <Globe className="w-3.5 h-3.5 text-violet-400" />
                Publicar proyecto
              </button>
              <div className="border-t border-white/8" />
              <button
                className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                onClick={() => { setMenuOpen(false); onDelete(project.id, project.name); }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishProject, setPublishProject] = useState<Project | null>(null);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const fetchProjects = () => {
    setLoading(true);
    apiService.get<ApiResponse>("/projects")
      .then((res) => setProjects(res.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id: string, name: string) => {
    try {
      await apiService.delete(`/projects/${id}`);
      toast({ title: "Proyecto eliminado", description: `"${name}" fue eliminado.` });
      fetchProjects();
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el proyecto.", variant: "destructive" });
    }
  };

  const handlePublish = async (type: "template" | "community") => {
    if (!publishProject) return;
    setPublishing(true);
    try {
      await apiService.post(`/projects/${publishProject.id}/publish`, { type });
      toast({
        title: type === "template" ? "Publicado como plantilla" : "Publicado en comunidad",
        description: `"${publishProject.name}" ya está disponible ${type === "template" ? "como plantilla" : "en la comunidad"}.`,
      });
      setPublishProject(null);
    } catch {
      toast({ title: "Error", description: "No se pudo publicar el proyecto.", variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <IconSidebar />

      <main className="flex-1 overflow-y-auto px-8 pt-10 pb-8">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-0.5">Mis Proyectos</h1>
              <p className="text-white/40 text-sm">Todos los proyectos que has creado</p>
            </div>
            <Button
              onClick={() => navigate("/ai-chat")}
              className="bg-white text-black hover:bg-white/90 font-medium text-sm h-9 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nuevo Proyecto
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-white/8 bg-[#1a1a1f] animate-pulse">
                  <div className="w-full aspect-[16/10] bg-white/5" />
                  <div className="px-4 py-3 bg-[#111116] flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-white/10 rounded w-3/4" />
                      <div className="h-2.5 bg-white/6 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <FolderX className="w-14 h-14 text-white/10" />
              <p className="text-white/60 text-base font-medium">No tienes proyectos aún</p>
              <p className="text-white/30 text-sm">Crea tu primer proyecto desde el AI Chat.</p>
              <Button
                onClick={() => navigate("/ai-chat")}
                className="bg-white text-black hover:bg-white/90 font-medium mt-2"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Crear proyecto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDelete}
                  onPublish={setPublishProject}
                  onClick={() => navigate(`/editor?project=${project.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Publish dialog */}
      <Dialog open={!!publishProject} onOpenChange={(open) => { if (!open) setPublishProject(null); }}>
        <DialogContent className="max-w-sm bg-[#1a1a1f] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Publicar proyecto</DialogTitle>
            <DialogDescription className="text-white/50">
              Elige cómo quieres compartir <span className="text-white/80 font-medium">"{publishProject?.name}"</span>
            </DialogDescription>
          </DialogHeader>

          <div className={`grid gap-3 pt-2 ${isAdmin ? "grid-cols-2" : "grid-cols-1"}`}>
            {isAdmin && (
              <button
                disabled={publishing}
                onClick={() => handlePublish("template")}
                className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/50 transition-all p-5 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-violet-500/15 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-violet-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">Plantilla</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">Otros usuarios pueden usar tu proyecto como base</p>
                </div>
              </button>
            )}

            <button
              disabled={publishing}
              onClick={() => handlePublish("community")}
              className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all p-5 disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Comunidad</p>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">Comparte tu proyecto con la comunidad de Orion</p>
              </div>
            </button>
          </div>

          {publishing && (
            <p className="text-center text-xs text-white/40 pt-1">Publicando...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
