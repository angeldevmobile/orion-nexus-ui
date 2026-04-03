import { IconSidebar } from "@/components/layout/IconSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, MessageSquare, Trophy, Star, Search, ThumbsUp, Eye, Copy, Plus, ExternalLink, Globe } from "lucide-react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { useState, useEffect } from "react";
import { apiService } from "@/service/ApiService";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: { username: string; avatar?: string };
  likes_count: number;
  views_count?: number;
  tags: string[];
  link?: string;
  attachments?: string[];
}

interface ApiPostRaw {
  id: string;
  title: string;
  content: string;
  author: { username: string; avatar?: string };
  likes_count: number;
  views_count?: number;
  tags: string[];
  attachments?: string[];
}

interface ApiResponse {
  data: ApiPostRaw[];
}

function mapPost(raw: ApiPostRaw): CommunityPost {
  return {
    ...raw,
    link: raw.attachments?.[0],
  };
}

/* ── Project View Modal ─────────────────────────────────────────── */
function ProjectViewModal({
  project,
  onClose,
}: {
  project: CommunityPost | null;
  onClose: () => void;
}) {
  if (!project) return null;

  return (
    <Dialog open={!!project} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">{project.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                por {project.author.username}
              </p>
            </div>
            {project.link && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(project.link, "_blank")}
                className="gap-2 shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir en nueva pestaña
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-2">{project.content}</p>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" /> {project.likes_count} likes
            </span>
            {project.views_count !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" /> {project.views_count} vistas
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Preview area */}
        <div className="flex-1 overflow-hidden bg-secondary/20">
          {project.link ? (
            <iframe
              src={project.link}
              title={project.title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Globe className="w-16 h-16 opacity-30" />
              <p className="text-lg font-medium">Sin preview disponible</p>
              <p className="text-sm">Este proyecto no tiene un link de demo.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function Community() {
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProject, setViewingProject] = useState<CommunityPost | null>(null);

  const fetchProjects = () => {
    apiService.get<ApiResponse>('/community/posts').then((res) => {
      setProjects((res.data || []).map(mapPost));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);


  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <IconSidebar />
        <main className="flex-1 ml-14 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2">
                  <Users className="w-8 h-8 text-primary" />
                  Comunidad
                </h1>
                <p className="text-muted-foreground">
                  Conecta con otros desarrolladores y comparte tus proyectos
                </p>
              </div>
              <Button
                onClick={() => setAddProjectModalOpen(true)}
                className="bg-primary hover:bg-primary/90 transition-all hover:scale-[1.05]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Subir mi proyecto
              </Button>
            </div>

            <Tabs defaultValue="projects" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="projects" className="gap-2">
                  <Star className="w-4 h-4" />
                  Proyectos Destacados
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Ranking
                </TabsTrigger>
                <TabsTrigger value="discussions" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discusiones
                </TabsTrigger>
              </TabsList>

              {/* Featured Projects */}
              <TabsContent value="projects" className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Buscar proyectos..." className="pl-10 bg-card border-border" />
                  </div>
                  <Button variant="outline">Filtros</Button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Cargando proyectos...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium">No hay proyectos aún</p>
                    <p className="text-sm mt-1">¡Sé el primero en publicar!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Card key={project.id} className="bg-card border-border hover:border-primary/50 transition-all group overflow-hidden">
                        {/* Thumbnail */}
                        <div className="h-36 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-5xl">
                          🚀
                        </div>

                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {project.author.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <CardTitle className="text-base mt-2">{project.title}</CardTitle>
                          <CardDescription>por {project.author.username}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{project.content}</p>

                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {project.views_count ?? 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {project.likes_count}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingProject(project)}
                              className="transition-all hover:scale-[1.05]"
                            >
                              Ver proyecto
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Leaderboard */}
              <TabsContent value="leaderboard">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Top Desarrolladores
                    </CardTitle>
                    <CardDescription>Los mejores de la comunidad este mes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                      <Trophy className="w-14 h-14 opacity-20" />
                      <p className="text-lg font-medium">Ranking próximamente</p>
                      <p className="text-sm">El sistema de puntos estará disponible pronto.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Discussions */}
              <TabsContent value="discussions">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Discusiones Recientes</CardTitle>
                        <CardDescription>Únete a la conversación</CardDescription>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90">Nueva discusión</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                      <MessageSquare className="w-14 h-14 opacity-20" />
                      <p className="text-lg font-medium">Sin discusiones aún</p>
                      <p className="text-sm">¡Sé el primero en iniciar una conversación!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <AddProjectModal
        open={addProjectModalOpen}
        onOpenChange={setAddProjectModalOpen}
        onProjectAdded={fetchProjects}
      />

      <ProjectViewModal
        project={viewingProject}
        onClose={() => setViewingProject(null)}
      />
    </div>
  );
}
