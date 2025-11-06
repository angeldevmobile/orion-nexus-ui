import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings as SettingsIcon, User, Bell, Shield, Code2, Palette, Globe, Download } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2">
                <SettingsIcon className="w-8 h-8 text-primary" />
                Configuración
              </h1>
              <p className="text-muted-foreground">
                Administra tu cuenta y preferencias
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="editor" className="gap-2">
                  <Code2 className="w-4 h-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="appearance" className="gap-2">
                  <Palette className="w-4 h-4" />
                  Apariencia
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notificaciones
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Seguridad
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Integraciones
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Información del Perfil</CardTitle>
                    <CardDescription>Actualiza tu información personal</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline">Cambiar foto</Button>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input id="name" defaultValue="John Doe" className="bg-background" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="john@example.com" className="bg-background" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <Input id="username" defaultValue="@johndoe" className="bg-background" />
                      </div>
                    </div>

                    <Button className="bg-primary hover:bg-primary/90">Guardar cambios</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Editor Tab */}
              <TabsContent value="editor">
                <Card className="bg-card border-border mb-6">
                  <CardHeader>
                    <CardTitle>Preferencias del Editor</CardTitle>
                    <CardDescription>Personaliza tu experiencia de codificación</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="font">Fuente del editor</Label>
                        <select id="font" className="w-full px-3 py-2 rounded-lg bg-background border border-border">
                          <option>Fira Code</option>
                          <option>JetBrains Mono</option>
                          <option>Courier New</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="fontsize">Tamaño de fuente</Label>
                        <Input id="fontsize" type="number" defaultValue="14" className="bg-background" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="theme">Tema del editor</Label>
                        <select id="theme" className="w-full px-3 py-2 rounded-lg bg-background border border-border">
                          <option>VS Code Dark</option>
                          <option>Monokai</option>
                          <option>Dracula</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Autocompletado</p>
                          <p className="text-sm text-muted-foreground">Sugerencias mientras escribes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Formatear al guardar</p>
                          <p className="text-sm text-muted-foreground">Formateo automático de código</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <Button className="bg-primary hover:bg-primary/90">Guardar preferencias</Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Exportación y Conversión</CardTitle>
                    <CardDescription>Convierte tu proyecto a diferentes lenguajes y frameworks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Exportar proyecto como:</Label>
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
                            className="justify-start h-auto py-3"
                          >
                            <span className="text-2xl mr-3">{framework.icon}</span>
                            <span className="font-medium">{framework.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Label className="mb-3 block">Opciones de exportación:</Label>
                      <div className="space-y-3">
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
                      </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Proyecto
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Apariencia</CardTitle>
                    <CardDescription>Personaliza la interfaz de Orion Builder</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-3 block">Tema</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="relative cursor-pointer rounded-lg border-2 border-primary p-4 bg-background">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Oscuro</span>
                              <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary" />
                            </div>
                            <div className="h-20 rounded bg-secondary" />
                          </div>
                          <div className="relative cursor-pointer rounded-lg border-2 border-border p-4 bg-background hover:border-primary/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Claro</span>
                              <div className="w-4 h-4 rounded-full border-2 border-border" />
                            </div>
                            <div className="h-20 rounded bg-gray-200" />
                          </div>
                          <div className="relative cursor-pointer rounded-lg border-2 border-border p-4 bg-background hover:border-primary/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Auto</span>
                              <div className="w-4 h-4 rounded-full border-2 border-border" />
                            </div>
                            <div className="h-20 rounded bg-gradient-to-r from-secondary to-gray-200" />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="accent">Color de acento</Label>
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary border-2 border-foreground cursor-pointer" />
                          <div className="w-10 h-10 rounded-lg bg-blue-500 border border-border cursor-pointer" />
                          <div className="w-10 h-10 rounded-lg bg-purple-500 border border-border cursor-pointer" />
                          <div className="w-10 h-10 rounded-lg bg-green-500 border border-border cursor-pointer" />
                          <div className="w-10 h-10 rounded-lg bg-orange-500 border border-border cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    <Button className="bg-primary hover:bg-primary/90">Aplicar cambios</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Notificaciones</CardTitle>
                    <CardDescription>Administra cómo y cuándo recibir notificaciones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificaciones por email</p>
                          <p className="text-sm text-muted-foreground">Recibir actualizaciones por correo</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificaciones push</p>
                          <p className="text-sm text-muted-foreground">Alertas en tiempo real</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Actualizaciones de proyectos</p>
                          <p className="text-sm text-muted-foreground">Cambios en tus proyectos</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Newsletter semanal</p>
                          <p className="text-sm text-muted-foreground">Tips y novedades</p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <Button className="bg-primary hover:bg-primary/90">Guardar preferencias</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>Protege tu cuenta y datos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">Contraseña actual</Label>
                        <Input id="current-password" type="password" className="bg-background" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">Nueva contraseña</Label>
                        <Input id="new-password" type="password" className="bg-background" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                        <Input id="confirm-password" type="password" className="bg-background" />
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-border pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Autenticación de dos factores</p>
                          <p className="text-sm text-muted-foreground">Mayor seguridad para tu cuenta</p>
                        </div>
                        <Switch />
                      </div>
                    </div>

                    <Button className="bg-primary hover:bg-primary/90">Actualizar contraseña</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integrations Tab */}
              <TabsContent value="integrations">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Integraciones</CardTitle>
                    <CardDescription>Conecta con servicios externos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: "GitHub", status: "Conectado", icon: "🔗" },
                      { name: "Vercel", status: "No conectado", icon: "▲" },
                      { name: "Firebase", status: "Conectado", icon: "🔥" },
                      { name: "Stripe", status: "No conectado", icon: "💳" },
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{integration.icon}</div>
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-muted-foreground">{integration.status}</p>
                          </div>
                        </div>
                        <Button variant={integration.status === "Conectado" ? "outline" : "default"} size="sm">
                          {integration.status === "Conectado" ? "Desconectar" : "Conectar"}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
