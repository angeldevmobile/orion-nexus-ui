import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Code2, Sparkles, Shield, Users, ArrowRight, Upload, Heart, Eye, Bookmark, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { UploadProjectModal } from "@/components/UploadProjectModal";
import { ViewProjectModal } from "@/components/ViewProjectModal";
import { useState, useEffect } from "react";
import { apiService } from "@/service/ApiService";

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

  useEffect(() => {
    apiService.get<{ data: PublicTemplate[] }>("/projects/public?type=template&limit=6")
      .then((res) => setTemplates(res.data || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && templates.length === 0) return null;

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">
            <Bookmark className="w-3.5 h-3.5 mr-1.5" />
            Plantillas de la comunidad
          </Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            Empieza desde una base real
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Proyectos publicados por la comunidad que puedes usar como punto de partida
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card animate-pulse">
                <div className="h-32 rounded-t-xl bg-secondary" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-secondary rounded w-2/3" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {templates.map((tpl) => {
              const fw = tpl.settings?.framework ?? "vanilla";
              const gradient = FW_GRADIENT[fw] ?? FW_GRADIENT.vanilla;
              return (
                <Card key={tpl.id} className="bg-card border-border hover:border-violet-500/40 transition-all group overflow-hidden">
                  <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    {tpl.settings?.thumbnail
                      ? <img src={tpl.settings.thumbnail} alt={tpl.name} className="w-full h-full object-cover" />
                      : <Bookmark className="w-10 h-10 opacity-20 text-violet-400" />
                    }
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{tpl.name}</CardTitle>
                    <CardDescription>
                      {tpl.description || "Sin descripción"} · por {tpl.owner_username ?? "anónimo"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2" asChild>
                      <Link to={`/editor?fork=${tpl.id}`}>
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
          <Button variant="outline" size="lg" asChild>
            <Link to="/community">
              <Globe className="w-4 h-4 mr-2" />
              Ver todas en comunidad
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

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

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Transform ideas into code instantly with our advanced AI engine",
    },
    {
      icon: Code2,
      title: "Live Code Editor",
      description: "Real-time editing with Monaco Editor and instant preview",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Deploy your applications in seconds, not hours",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security for your projects and data",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with your team",
    },
    {
      icon: Rocket,
      title: "One-Click Deploy",
      description: "Deploy to production with a single click",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center animate-fade-in">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                🚀 Now with AI Code Generation
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Build Applications
                <br />
                at the Speed of Thought
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Transform your ideas into production-ready applications using AI-powered development tools. 
                No complexity, just results.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg h-14 px-8">
                  <Link to="/auth">
                    Start Building Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8">
                  <Link to="/dashboard">
                    View Demo
                  </Link>
                </Button>
              </div>
            </div>

            {/* Hero Image/Demo */}
            <div className="mt-20 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
              <Card className="bg-card/50 border-border backdrop-blur-sm overflow-hidden">
                <div className="p-8">
                  <div className="bg-secondary/50 rounded-xl p-6 font-mono text-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-2 text-muted-foreground">
                      <p><span className="text-primary">$</span> orion generate "modern dashboard with analytics"</p>
                      <p className="text-foreground">✓ Creating project structure...</p>
                      <p className="text-foreground">✓ Generating components...</p>
                      <p className="text-foreground">✓ Optimizing performance...</p>
                      <p className="text-primary">✨ Your project is ready!</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Community Showcase Section */}
        <CommunityShowcase />

        {/* Features Section */}
        <section className="py-20 px-4 bg-secondary/20">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
                Everything you need to build faster
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional tools designed for modern development workflows
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <Card 
                  key={feature.title} 
                  className="bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                  Ready to build something amazing?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join thousands of developers building the future with AI
                </p>
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg h-14 px-8">
                  <Link to="/auth">
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Community Projects Section */}
        <section className="py-20 px-4 bg-secondary/20">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                🌟 Proyectos de la Comunidad
              </Badge>
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
                Creado por la comunidad
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                Explora proyectos increíbles construidos con Orion Builder
              </p>
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="bg-primary hover:bg-primary/90 transition-all hover:scale-[1.05]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir mi proyecto
              </Button>
            </div>

            {loadingProjects ? (
              <div className="text-center py-16 text-muted-foreground">Cargando proyectos...</div>
            ) : communityProjects.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground space-y-2">
                <p className="text-lg font-medium">Aún no hay proyectos publicados</p>
                <p className="text-sm">¡Sé el primero en compartir tu proyecto con la comunidad!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityProjects.map((project, idx) => (
                  <Card
                    key={idx}
                    className="bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer group overflow-hidden"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                      {project.image}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {project.author && (
                        <CardDescription className="text-xs text-muted-foreground">
                          por {project.author}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" /> {project.likes ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {project.views ?? 0} vistas
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full transition-all hover:scale-[1.02]"
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
              <Button variant="outline" size="lg" asChild>
                <Link to="/community">
                  Ver todos los proyectos
                  <ArrowRight className="ml-2 w-5 h-5" />
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
