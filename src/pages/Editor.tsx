import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code2, Play, Save, Download, Settings2, FileCode, Layout, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useProject } from "@/contexts/ProjectContext";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Editor() {
  const { files, activeFile, setActiveFile: setProjectActiveFile, updateFileContent } = useProject();
  const [localActiveFile, setLocalActiveFile] = useState(activeFile);
  const [configOpen, setConfigOpen] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setLocalActiveFile(activeFile);
  }, [activeFile]);

  useEffect(() => {
    const file = files.find(f => f.name === localActiveFile);
    if (file) {
      setEditedContent(file.content);
    }
  }, [localActiveFile, files]);

  const handleFileSelect = (fileName: string) => {
    setLocalActiveFile(fileName);
    setProjectActiveFile(fileName);
  };

  const handleSave = () => {
    updateFileContent(localActiveFile, editedContent);
    toast({
      title: "Guardado exitoso",
      description: `${localActiveFile} ha sido guardado correctamente.`,
    });
  };

  const currentFile = files.find(f => f.name === localActiveFile);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 pt-16">
          <div className="flex h-[calc(100vh-4rem)]">
            
            {/* File Explorer */}
            <div className="w-64 border-r border-border bg-card p-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Archivos
                </h2>
              </div>
              <div className="space-y-1">
                {files.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => handleFileSelect(file.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      localActiveFile === file.name
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-xs opacity-70">{file.size}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col">
              <div className="border-b border-border p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-primary" />
                      <span className="font-heading font-semibold">Editor de Código</span>
                    </div>
                    <Badge variant="secondary">{localActiveFile}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings2 className="w-4 h-4 mr-2" />
                          Configurar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Configuración y Exportación</DialogTitle>
                          <DialogDescription>
                            Convierte y exporta tu proyecto a diferentes lenguajes y frameworks
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                          <div className="space-y-4">
                            <Label className="text-base font-semibold">Exportar proyecto como:</Label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { name: "React", icon: "⚛️" },
                                { name: "HTML/CSS/JS", icon: "🌐" },
                                { name: "Flutter", icon: "📱" },
                                { name: "Vue.js", icon: "💚" },
                                { name: "Angular", icon: "🅰️" },
                                { name: "Next.js", icon: "▲" },
                                { name: "Svelte", icon: "🔥" },
                                { name: "AppScript", icon: "📜" },
                              ].map((framework) => (
                                <Button
                                  key={framework.name}
                                  variant="outline"
                                  className="justify-start h-auto py-3 hover:bg-primary/10 hover:border-primary"
                                >
                                  <span className="text-2xl mr-3">{framework.icon}</span>
                                  <span className="font-medium">{framework.name}</span>
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-border">
                            <Label className="text-base font-semibold mb-4 block">Opciones de exportación:</Label>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">Incluir dependencias</p>
                                  <p className="text-xs text-muted-foreground">package.json con todas las librerías</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">Minificar código</p>
                                  <p className="text-xs text-muted-foreground">Optimizar para producción</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">Comentarios en código</p>
                                  <p className="text-xs text-muted-foreground">Documentación automática</p>
                                </div>
                                <Switch />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">TypeScript</p>
                                  <p className="text-xs text-muted-foreground">Usar TypeScript en lugar de JavaScript</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-border flex gap-3">
                            <Button className="flex-1 bg-primary hover:bg-primary/90">
                              <Download className="w-4 h-4 mr-2" />
                              Exportar Proyecto
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setConfigOpen(false)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Play className="w-4 h-4 mr-2" />
                      Ejecutar
                    </Button>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="code" className="flex-1">
                <div className="border-b border-border bg-card px-4">
                  <TabsList>
                    <TabsTrigger value="code">Código</TabsTrigger>
                    <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                    <TabsTrigger value="console">Consola</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="code" className="flex-1 m-0">
                  <div className="h-[calc(100vh-13rem)] bg-background p-6">
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="h-full bg-card/50 border-border font-mono text-sm resize-none"
                      placeholder="Escribe tu código aquí..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 m-0">
                  <div className="h-[calc(100vh-13rem)] bg-muted/20 p-6">
                    <Card className="h-full bg-background border-2 border-border overflow-auto">
                      <div className="p-8">
                        <div className="mb-4 pb-4 border-b border-border">
                          <Badge variant="secondary">Vista Previa</Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            Archivo: {localActiveFile}
                          </p>
                        </div>
                        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                          <code>{currentFile?.content || "No hay contenido disponible"}</code>
                        </pre>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="console" className="flex-1 m-0">
                  <div className="h-[calc(100vh-13rem)] bg-background p-6">
                    <Card className="h-full bg-card border-border p-4 overflow-auto font-mono text-sm">
                      <div className="space-y-2 text-muted-foreground">
                        <p><span className="text-primary">✓</span> Build successful</p>
                        <p><span className="text-primary">✓</span> Compiled in 234ms</p>
                        <p><span className="text-green-500">→</span> Server running at http://localhost:3000</p>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Properties Panel */}
            <div className="w-80 border-l border-border bg-card p-4">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Propiedades
              </h2>
              <div className="space-y-4">
                <Card className="p-4 bg-secondary/50 border-border">
                  <h3 className="text-sm font-medium mb-2">Componente Seleccionado</h3>
                  <p className="text-xs text-muted-foreground">Button</p>
                </Card>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium block mb-2">Color</label>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary border-2 border-foreground cursor-pointer" />
                      <div className="w-8 h-8 rounded-lg bg-secondary border border-border cursor-pointer" />
                      <div className="w-8 h-8 rounded-lg bg-destructive border border-border cursor-pointer" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-2">Tamaño</label>
                    <select className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border">
                      <option>Default</option>
                      <option>Small</option>
                      <option>Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-2">Variante</label>
                    <select className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border">
                      <option>Default</option>
                      <option>Outline</option>
                      <option>Ghost</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
