import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Code2, ExternalLink, Copy, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ViewProjectModal } from "@/components/ViewProjectModal";
import { useState } from "react";

export default function Projects() {
  const [viewProjectModalOpen, setViewProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleOpenProject = (project: any) => {
    setSelectedProject(project);
    setViewProjectModalOpen(true);
  };

  const projects = [
    {
      name: "E-commerce Dashboard",
      description: "Full-featured admin dashboard with analytics",
      status: "deployed",
      framework: "React",
      lastUpdate: "2 hours ago",
    },
    {
      name: "Landing Page",
      description: "Modern SaaS landing with animations",
      status: "active",
      framework: "React",
      lastUpdate: "5 hours ago",
    },
    {
      name: "Mobile App UI",
      description: "Cross-platform mobile interface",
      status: "draft",
      framework: "Flutter",
      lastUpdate: "1 day ago",
    },
    {
      name: "API Dashboard",
      description: "REST API monitoring and management",
      status: "active",
      framework: "React",
      lastUpdate: "3 days ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-bold mb-2">Projects</h1>
                <p className="text-muted-foreground">Manage and deploy your applications</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/ai-chat">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.name} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Code2 className="w-5 h-5 text-primary" />
                      </div>
                      <Badge 
                        variant={project.status === "deployed" ? "default" : "secondary"}
                        className={project.status === "deployed" ? "bg-primary" : ""}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{project.framework}</span>
                      <span>{project.lastUpdate}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 transition-all hover:scale-[1.02]"
                        onClick={() => handleOpenProject(project)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>

      <ViewProjectModal
        open={viewProjectModalOpen}
        onOpenChange={setViewProjectModalOpen}
        project={selectedProject || { name: "", description: "", framework: "React" }}
      />
    </div>
  );
}
