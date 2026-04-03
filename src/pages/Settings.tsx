import { useState, useEffect, useRef } from "react";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings as SettingsIcon, User, Bell, Shield, Code2, Palette, Globe, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:5000/api";

export default function Settings() {
  const { user, token, updateUser } = useAuth();
  const { toast } = useToast();

  // Profile state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification preferences
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifProjects, setNotifProjects] = useState(true);
  const [notifNewsletter, setNotifNewsletter] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  // Editor preferences
  const [editorFont, setEditorFont] = useState("Fira Code");
  const [editorFontSize, setEditorFontSize] = useState("14");
  const [editorTheme, setEditorTheme] = useState("VS Code Dark");
  const [autocomplete, setAutocomplete] = useState(true);
  const [formatOnSave, setFormatOnSave] = useState(true);
  const [savingEditor, setSavingEditor] = useState(false);

  // Appearance preferences
  const [appTheme, setAppTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("cyan");
  const [savingAppearance, setSavingAppearance] = useState(false);

  // Integrations
  const [disconnectingGithub, setDisconnectingGithub] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setAvatar(user.avatar || "");
      const prefs = user.preferences as Record<string, unknown> | undefined;
      if (prefs) {
        if (prefs.notifEmail !== undefined) setNotifEmail(Boolean(prefs.notifEmail));
        if (prefs.notifPush !== undefined) setNotifPush(Boolean(prefs.notifPush));
        if (prefs.notifProjects !== undefined) setNotifProjects(Boolean(prefs.notifProjects));
        if (prefs.notifNewsletter !== undefined) setNotifNewsletter(Boolean(prefs.notifNewsletter));
        if (prefs.editorFont) setEditorFont(String(prefs.editorFont));
        if (prefs.editorFontSize) setEditorFontSize(String(prefs.editorFontSize));
        if (prefs.editorTheme) setEditorTheme(String(prefs.editorTheme));
        if (prefs.autocomplete !== undefined) setAutocomplete(Boolean(prefs.autocomplete));
        if (prefs.formatOnSave !== undefined) setFormatOnSave(Boolean(prefs.formatOnSave));
        if (prefs.appTheme) setAppTheme(String(prefs.appTheme));
        if (prefs.accentColor) setAccentColor(String(prefs.accentColor));
      }
    }
  }, [user]);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ username, avatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar perfil");
      updateUser(data.data);
      toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados." });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error desconocido", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cambiar contraseña");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada exitosamente." });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error desconocido", variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotif(true);
    try {
      const currentPrefs = (user?.preferences as Record<string, unknown>) || {};
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          preferences: {
            ...currentPrefs,
            notifEmail,
            notifPush,
            notifProjects,
            notifNewsletter,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar notificaciones");
      updateUser(data.data);
      toast({ title: "Notificaciones guardadas", description: "Tus preferencias han sido actualizadas." });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error desconocido", variant: "destructive" });
    } finally {
      setSavingNotif(false);
    }
  };

  const handleSaveEditor = async () => {
    setSavingEditor(true);
    try {
      const currentPrefs = (user?.preferences as Record<string, unknown>) || {};
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          preferences: {
            ...currentPrefs,
            editorFont,
            editorFontSize,
            editorTheme,
            autocomplete,
            formatOnSave,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar preferencias");
      updateUser(data.data);
      toast({ title: "Preferencias guardadas", description: "Tu configuración del editor ha sido actualizada." });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error desconocido", variant: "destructive" });
    } finally {
      setSavingEditor(false);
    }
  };

  const handleSaveAppearance = async () => {
    setSavingAppearance(true);
    try {
      const currentPrefs = (user?.preferences as Record<string, unknown>) || {};
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          preferences: { ...currentPrefs, appTheme, accentColor },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar apariencia");
      updateUser(data.data);
      toast({ title: "Apariencia guardada", description: "Tu configuración visual ha sido actualizada." });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error desconocido", variant: "destructive" });
    } finally {
      setSavingAppearance(false);
    }
  };

  const handleGithubConnect = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  const handleGithubDisconnect = async () => {
    setDisconnectingGithub(true);
    try {
      const res = await fetch(`${API_BASE}/auth/github`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al desconectar GitHub");
      updateUser(data.data);
      toast({ title: "GitHub desconectado", description: "Tu cuenta de GitHub ha sido desvinculada." });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Error desconocido", variant: "destructive" });
    } finally {
      setDisconnectingGithub(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <IconSidebar />
        <main className="flex-1 ml-14 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2">
                <SettingsIcon className="w-8 h-8 text-primary" />
                Configuración
              </h1>
              <p className="text-muted-foreground">Administra tu cuenta y preferencias</p>
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
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          Cambiar foto
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nombre de usuario</Label>
                        <Input
                          id="name"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          disabled
                          className="bg-background opacity-60 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">El email no se puede cambiar desde aquí.</p>
                      </div>
                    </div>

                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                    >
                      {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Guardar cambios
                    </Button>
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
                        <select
                          id="font"
                          value={editorFont}
                          onChange={(e) => setEditorFont(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border"
                        >
                          <option>Fira Code</option>
                          <option>JetBrains Mono</option>
                          <option>Courier New</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="fontsize">Tamaño de fuente</Label>
                        <Input
                          id="fontsize"
                          type="number"
                          value={editorFontSize}
                          onChange={(e) => setEditorFontSize(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="theme">Tema del editor</Label>
                        <select
                          id="theme"
                          value={editorTheme}
                          onChange={(e) => setEditorTheme(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-background border border-border"
                        >
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
                        <Switch checked={autocomplete} onCheckedChange={setAutocomplete} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Formatear al guardar</p>
                          <p className="text-sm text-muted-foreground">Formateo automático de código</p>
                        </div>
                        <Switch checked={formatOnSave} onCheckedChange={setFormatOnSave} />
                      </div>
                    </div>

                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleSaveEditor}
                      disabled={savingEditor}
                    >
                      {savingEditor && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Guardar preferencias
                    </Button>
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
                          <Button key={framework.name} variant="outline" className="justify-start h-auto py-3">
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
                          {[
                            { value: "dark", label: "Oscuro", preview: <div className="h-20 rounded bg-secondary" /> },
                            { value: "light", label: "Claro", preview: <div className="h-20 rounded bg-gray-200" /> },
                            { value: "auto", label: "Auto", preview: <div className="h-20 rounded bg-gradient-to-r from-secondary to-gray-200" /> },
                          ].map((t) => (
                            <div
                              key={t.value}
                              onClick={() => setAppTheme(t.value)}
                              className={`relative cursor-pointer rounded-lg border-2 p-4 bg-background transition-colors ${appTheme === t.value ? "border-primary" : "border-border hover:border-primary/50"}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{t.label}</span>
                                <div className={`w-4 h-4 rounded-full border-2 ${appTheme === t.value ? "border-primary bg-primary" : "border-border"}`} />
                              </div>
                              {t.preview}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Color de acento</Label>
                        <div className="flex gap-3">
                          {[
                            { value: "cyan", className: "bg-primary" },
                            { value: "blue", className: "bg-blue-500" },
                            { value: "purple", className: "bg-purple-500" },
                            { value: "green", className: "bg-green-500" },
                            { value: "orange", className: "bg-orange-500" },
                          ].map((c) => (
                            <div
                              key={c.value}
                              onClick={() => setAccentColor(c.value)}
                              className={`w-10 h-10 rounded-lg ${c.className} cursor-pointer transition-transform hover:scale-110 ${accentColor === c.value ? "border-2 border-foreground scale-110" : "border border-border"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleSaveAppearance}
                      disabled={savingAppearance}
                    >
                      {savingAppearance && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Aplicar cambios
                    </Button>
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
                        <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificaciones push</p>
                          <p className="text-sm text-muted-foreground">Alertas en tiempo real</p>
                        </div>
                        <Switch checked={notifPush} onCheckedChange={setNotifPush} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Actualizaciones de proyectos</p>
                          <p className="text-sm text-muted-foreground">Cambios en tus proyectos</p>
                        </div>
                        <Switch checked={notifProjects} onCheckedChange={setNotifProjects} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Newsletter semanal</p>
                          <p className="text-sm text-muted-foreground">Tips y novedades</p>
                        </div>
                        <Switch checked={notifNewsletter} onCheckedChange={setNotifNewsletter} />
                      </div>
                    </div>

                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleSaveNotifications}
                      disabled={savingNotif}
                    >
                      {savingNotif && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Guardar preferencias
                    </Button>
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
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">Nueva contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-background"
                        />
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

                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                    >
                      {savingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Actualizar contraseña
                    </Button>
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
                    {/* GitHub — real connection */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🔗</div>
                        <div>
                          <p className="font-medium">GitHub</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.github_id ? "Conectado" : "No conectado"}
                          </p>
                        </div>
                      </div>
                      {user?.github_id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGithubDisconnect}
                          disabled={disconnectingGithub}
                        >
                          {disconnectingGithub && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          Desconectar
                        </Button>
                      ) : (
                        <Button size="sm" onClick={handleGithubConnect}>
                          Conectar
                        </Button>
                      )}
                    </div>

                    {/* Other integrations — coming soon */}
                    {[
                      { name: "Vercel", icon: "▲" },
                      { name: "Firebase", icon: "🔥" },
                      { name: "Stripe", icon: "💳" },
                    ].map((integration) => (
                      <div
                        key={integration.name}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{integration.icon}</div>
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-muted-foreground">Próximamente</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          Conectar
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
