import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Trophy, Star, Search, ThumbsUp, Eye, Copy, Plus } from "lucide-react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { useState } from "react";

export default function Community() {
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState([
    {
      name: "Modern Dashboard",
      author: "Sarah Johnson",
      avatar: "SJ",
      views: 12500,
      likes: 450,
      description: "Dashboard moderno con analytics en tiempo real",
      tags: ["React", "Analytics", "Dashboard"],
      link: "https://example.com/dashboard",
    },
    {
      name: "E-commerce Landing",
      author: "Mike Chen",
      avatar: "MC",
      views: 9800,
      likes: 380,
      description: "Landing page para tienda online con animaciones",
      tags: ["E-commerce", "Animation", "Landing"],
      link: "https://example.com/ecommerce",
    },
    {
      name: "SaaS Platform UI",
      author: "Emma Wilson",
      avatar: "EW",
      views: 8200,
      likes: 320,
      description: "Interfaz completa para plataforma SaaS",
      tags: ["SaaS", "UI Kit", "Enterprise"],
      link: "https://example.com/saas",
    },
  ]);

  const handleProjectAdded = (newProject: { name: string; link: string }) => {
    const project = {
      ...newProject,
      author: "Usuario Actual",
      avatar: "UA",
      views: 0,
      likes: 0,
      description: "Proyecto compartido por la comunidad",
      tags: ["Nuevo"],
    };
    setProjects([project, ...projects]);
  };

  const topProjects = projects;

  const leaderboard = [
    { rank: 1, name: "Alex Rivera", points: 15420, avatar: "AR", badge: "🏆" },
    { rank: 2, name: "Sofia Martinez", points: 14850, avatar: "SM", badge: "🥈" },
    { rank: 3, name: "David Kim", points: 13200, avatar: "DK", badge: "🥉" },
    { rank: 4, name: "Lisa Anderson", points: 11500, avatar: "LA", badge: "⭐" },
    { rank: 5, name: "James Chen", points: 10800, avatar: "JC", badge: "⭐" },
  ];

  const discussions = [
    {
      title: "¿Cómo optimizar el rendimiento de builds?",
      author: "Carlos R.",
      replies: 24,
      views: 342,
      time: "Hace 2 horas",
    },
    {
      title: "Mejores prácticas para componentes reutilizables",
      author: "Ana M.",
      replies: 18,
      views: 289,
      time: "Hace 5 horas",
    },
    {
      title: "Integración con APIs externas",
      author: "Pedro L.",
      replies: 31,
      views: 456,
      time: "Hace 1 día",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 pt-24">
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
                Agregar Proyecto
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
                    <Input
                      placeholder="Buscar proyectos..."
                      className="pl-10 bg-card border-border"
                    />
                  </div>
                  <Button variant="outline">Filtros</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topProjects.map((project) => (
                    <Card key={project.name} className="bg-card border-border hover:border-primary/50 transition-all group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-4">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {project.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>por {project.author}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {project.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {project.likes}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(project.link, '_blank')}
                            className="transition-all hover:scale-[1.05]"
                          >
                            Ver proyecto
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                    <div className="space-y-4">
                      {leaderboard.map((user) => (
                        <div
                          key={user.rank}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold w-8 text-center">
                              {user.badge}
                            </span>
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {user.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                #{user.rank} en el ranking
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {user.points.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">puntos</p>
                          </div>
                        </div>
                      ))}
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
                      <Button className="bg-primary hover:bg-primary/90">
                        Nueva discusión
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {discussions.map((discussion) => (
                        <div
                          key={discussion.title}
                          className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium">{discussion.title}</h3>
                            <Badge variant="secondary">{discussion.time}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            por {discussion.author}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {discussion.replies} respuestas
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {discussion.views} vistas
                            </span>
                          </div>
                        </div>
                      ))}
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
        onProjectAdded={handleProjectAdded}
      />
    </div>
  );
}
