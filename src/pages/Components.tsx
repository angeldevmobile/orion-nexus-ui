import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Copy, Eye, Download, Layers } from "lucide-react";
import { useState } from "react";

export default function Components() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Todos", count: 48 },
    { name: "Buttons", count: 12 },
    { name: "Forms", count: 8 },
    { name: "Cards", count: 10 },
    { name: "Navigation", count: 6 },
    { name: "Layouts", count: 5 },
    { name: "Data Display", count: 7 },
  ];

  const components = [
    {
      name: "Primary Button",
      category: "Buttons",
      description: "Botón principal con estilos personalizados",
      preview: "button",
    },
    {
      name: "Hero Section",
      category: "Layouts",
      description: "Sección hero moderna con gradiente",
      preview: "hero",
    },
    {
      name: "Login Form",
      category: "Forms",
      description: "Formulario de autenticación completo",
      preview: "form",
    },
    {
      name: "Stats Card",
      category: "Cards",
      description: "Tarjeta de estadísticas con iconos",
      preview: "card",
    },
    {
      name: "Navbar",
      category: "Navigation",
      description: "Barra de navegación responsive",
      preview: "nav",
    },
    {
      name: "Data Table",
      category: "Data Display",
      description: "Tabla con paginación y filtros",
      preview: "table",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2">
                <Layers className="w-8 h-8 text-primary" />
                Biblioteca de Componentes
              </h1>
              <p className="text-muted-foreground">
                Componentes UI pre-construidos listos para usar
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar componentes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs defaultValue="Todos" className="mb-8">
              <TabsList className="w-full justify-start overflow-x-auto">
                {categories.map((cat) => (
                  <TabsTrigger key={cat.name} value={cat.name} className="gap-2">
                    {cat.name}
                    <Badge variant="secondary" className="ml-1">
                      {cat.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="Todos" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {components.map((component) => (
                    <Card key={component.name} className="bg-card border-border hover:border-primary/50 transition-all group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary">{component.category}</Badge>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-lg">{component.name}</CardTitle>
                        <CardDescription>{component.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Preview Area */}
                        <div className="h-32 bg-secondary/30 rounded-lg mb-4 flex items-center justify-center border border-border">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                              <Layers className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-xs text-muted-foreground">Vista Previa</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                          <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                            <Download className="w-4 h-4 mr-2" />
                            Usar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {categories.slice(1).map((cat) => (
                <TabsContent key={cat.name} value={cat.name} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {components
                      .filter((c) => c.category === cat.name)
                      .map((component) => (
                        <Card key={component.name} className="bg-card border-border">
                          <CardHeader>
                            <CardTitle className="text-lg">{component.name}</CardTitle>
                            <CardDescription>{component.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="h-32 bg-secondary/30 rounded-lg mb-4 flex items-center justify-center">
                              <p className="text-sm text-muted-foreground">Vista Previa</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar
                              </Button>
                              <Button size="sm" className="flex-1 bg-primary">
                                Usar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
