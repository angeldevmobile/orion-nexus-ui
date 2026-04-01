import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Github, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/service/AuthService";
import { useAuth } from "@/hooks/useAuth"; 

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [formData, setFormData] = useState({
    signin: { email: "", password: "" },
    signup: { username: "", email: "", password: "" },
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth(); 

  const handleInputChange = (
    tab: "signin" | "signup",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };

  // Login con GitHub
  const handleGitHubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login(formData.signin);
      login(); 
      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Has iniciado sesión correctamente",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description:
          error instanceof Error ? error.message : "Credenciales inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  type BackendError = {
    message?: string;
    errors?: { msg?: string; message?: string }[];
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.signup.password.length < 8) {
      toast({
        title: "Contraseña demasiado corta",
        description: "La contraseña debe tener al menos 8 caracteres.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await authService.register(formData.signup);
      login(); 
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente",
      });
      navigate("/dashboard");
    } catch (error) {
      const err = error as BackendError;
      let description = "Error al crear la cuenta";
      if (err.message) {
        description = err.message;
      }
      if (err.errors && Array.isArray(err.errors)) {
        description = err.errors.map((e) => e.msg || e.message).join("\n");
      }
      toast({
        title: "Error al crear cuenta",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.requestPasswordReset({ email: recoveryEmail });
      toast({
        title: "Email enviado",
        description: "Revisa tu correo para recuperar tu contraseña",
      });
      setRecoveryOpen(false);
      setRecoveryEmail("");
    } catch (error) {
      toast({
        title: "Error al enviar email",
        description:
          error instanceof Error ? error.message : "No se pudo enviar el email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Back to home button */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al inicio</span>
      </Link>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 animate-scale-in">
            <span className="text-3xl">🪐</span>
          </div>
          <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Orion Builder
          </h1>
          <p className="text-muted-foreground">
            Comienza tu viaje de desarrollo con IA
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-border shadow-2xl">
          <Tabs defaultValue="signin" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Registrarse
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-6">
              <TabsContent value="signin" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">
                    Bienvenido de vuelta
                  </CardTitle>
                  <CardDescription>
                    Ingresa tus credenciales para continuar construyendo
                  </CardDescription>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
                    type="button"
                    disabled>
                    <Mail className="w-5 h-5 mr-3 text-red-500" />
                    Continuar con Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    type="button"
                    onClick={handleGitHubLogin}>
                    <Github className="w-5 h-5 mr-3" />
                    Continuar con GitHub
                  </Button>
                </div>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    O con email
                  </span>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.signin.email}
                      onChange={(e) =>
                        handleInputChange("signin", "email", e.target.value)
                      }
                      required
                      className="bg-background h-11 border-border focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password">Contraseña</Label>
                      <button
                        type="button"
                        onClick={() => setRecoveryOpen(true)}
                        className="text-xs text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <Input
                      id="signin-password"
                      type="password"
                      value={formData.signin.password}
                      onChange={(e) =>
                        handleInputChange("signin", "password", e.target.value)
                      }
                      required
                      className="bg-background h-11 border-border focus:border-primary transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
                    disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6 mt-0">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">Crear cuenta nueva</CardTitle>
                  <CardDescription>
                    Únete a miles de desarrolladores construyendo con IA
                  </CardDescription>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
                    type="button"
                    disabled>
                    <Mail className="w-5 h-5 mr-3 text-red-500" />
                    Registrarse con Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    type="button"
                    onClick={handleGitHubLogin}>
                    <Github className="w-5 h-5 mr-3" />
                    Registrarse con GitHub
                  </Button>
                </div>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    O con email
                  </span>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre de usuario</Label>
                    <Input
                      id="signup-name"
                      placeholder="juanperez"
                      value={formData.signup.username}
                      onChange={(e) =>
                        handleInputChange("signup", "username", e.target.value)
                      }
                      required
                      className="bg-background h-11 border-border focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.signup.email}
                      onChange={(e) =>
                        handleInputChange("signup", "email", e.target.value)
                      }
                      required
                      className="bg-background h-11 border-border focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={formData.signup.password}
                      onChange={(e) =>
                        handleInputChange("signup", "password", e.target.value)
                      }
                      required
                      className="bg-background h-11 border-border focus:border-primary transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
                    disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Al registrarte, aceptas nuestros{" "}
                    <Link to="#" className="text-primary hover:underline">
                      Términos de Servicio
                    </Link>{" "}
                    y{" "}
                    <Link to="#" className="text-primary hover:underline">
                      Política de Privacidad
                    </Link>
                  </p>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Password Recovery Modal */}
      <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordRecovery} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="tu@email.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRecoveryOpen(false)}
                className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Enviando..." : "Enviar Email"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
