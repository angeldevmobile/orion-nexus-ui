import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Clock, FolderX, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService } from "@/service/ApiService";
import { useToast } from "@/hooks/use-toast";
import { IconSidebar } from "@/components/layout/IconSidebar";

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  data: Project[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} día${days > 1 ? "s" : ""}`;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <IconSidebar />

      <main className="flex-1 overflow-y-auto p-8 pt-10">
        <div className="max-w-5xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-1">Mis Proyectos</h1>
              <p className="text-muted-foreground">Todos los proyectos que has creado</p>
            </div>
            <Button onClick={() => navigate("/ai-chat")} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm">Cargando proyectos...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
              <FolderX className="w-16 h-16 opacity-20" />
              <p className="text-lg font-medium">No tienes proyectos aún</p>
              <p className="text-sm">Crea tu primer proyecto desde el AI Chat o el Editor.</p>
              <Button onClick={() => navigate("/ai-chat")} className="bg-primary hover:bg-primary/90 mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Crear proyecto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <Card key={project.id} className="bg-card border-border hover:border-primary/50 transition-all group">
                  <CardHeader className="pb-3">
                    <div className="p-2 w-fit rounded-lg bg-primary/10 mb-3">
                      <Code2 className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base leading-tight">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Actualizado {timeAgo(project.updated_at)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 transition-all hover:scale-[1.02]"
                        onClick={() => navigate("/editor")}
                      >
                        <Code2 className="w-4 h-4 mr-2" />
                        Abrir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(project.id, project.name)}
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
