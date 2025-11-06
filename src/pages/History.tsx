import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History as HistoryIcon, RotateCcw, Download, Trash2, GitBranch, Sparkles } from "lucide-react";

export default function History() {
  const activities = [
    {
      type: "ai-generation",
      title: "Generación IA: Dashboard de Analytics",
      description: "Creado con prompt: 'Dashboard moderno con gráficas'",
      time: "Hace 2 horas",
      icon: Sparkles,
      status: "completed",
    },
    {
      type: "export",
      title: "Exportación: E-commerce Landing",
      description: "Exportado a React con TypeScript",
      time: "Hace 5 horas",
      icon: Download,
      status: "completed",
    },
    {
      type: "deploy",
      title: "Deploy: Portfolio Website",
      description: "Desplegado en Vercel",
      time: "Hace 1 día",
      icon: GitBranch,
      status: "completed",
    },
    {
      type: "ai-generation",
      title: "Generación IA: Formulario de Contacto",
      description: "Componente creado con validación",
      time: "Hace 2 días",
      icon: Sparkles,
      status: "completed",
    },
    {
      type: "optimization",
      title: "Optimización: Login Page",
      description: "Código optimizado y refactorizado",
      time: "Hace 3 días",
      icon: RotateCcw,
      status: "completed",
    },
  ];

  const versions = [
    { version: "v3.2.1", date: "2024-01-15", changes: "Actualización de componentes UI" },
    { version: "v3.2.0", date: "2024-01-10", changes: "Nuevo sistema de diseño" },
    { version: "v3.1.5", date: "2024-01-05", changes: "Corrección de errores" },
    { version: "v3.1.0", date: "2024-01-01", changes: "Integración con IA mejorada" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 pt-24">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2">
                <HistoryIcon className="w-8 h-8 text-primary" />
                Historial y Actividad
              </h1>
              <p className="text-muted-foreground">
                Revisa tus acciones y restaura versiones anteriores
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Activity Timeline */}
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities.map((activity, idx) => (
                        <div
                          key={idx}
                          className="relative pl-8 pb-6 border-l-2 border-border last:border-l-0 last:pb-0"
                        >
                          <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                          
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <activity.icon className="w-4 h-4 text-primary" />
                                <h3 className="font-medium">{activity.title}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-xs">
                                  {activity.time}
                                </Badge>
                                <Badge className="text-xs bg-primary/10 text-primary">
                                  {activity.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full mt-6">
                      Cargar más actividades
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Version History */}
              <div>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Versiones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {versions.map((ver) => (
                        <div
                          key={ver.version}
                          className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge className="bg-primary/10 text-primary">
                              {ver.version}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {ver.date}
                          </p>
                          <p className="text-sm">{ver.changes}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="bg-card border-border mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Generaciones IA</span>
                        <span className="font-medium">248</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-3/4" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Exportaciones</span>
                        <span className="font-medium">42</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-1/2" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Deploys</span>
                        <span className="font-medium">18</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
