import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Github, ArrowLeft, Zap, Bot, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/service/AuthService";
import { useAuth } from "@/hooks/useAuth";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleGitHubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/github`;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.token, response.user);
      toast({ title: "¡Bienvenido de vuelta!", description: "Has iniciado sesión correctamente" });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error instanceof Error ? error.message : "Credenciales inválidas",
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
      toast({ title: "Email enviado", description: "Revisa tu correo para recuperar tu contraseña" });
      setRecoveryOpen(false);
      setRecoveryEmail("");
    } catch (error) {
      toast({
        title: "Error al enviar email",
        description: error instanceof Error ? error.message : "No se pudo enviar el email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04060d] flex relative overflow-hidden">
      <style>{`
        @keyframes orb1 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(60px, -80px) scale(1.1); }
          66%  { transform: translate(-40px, 50px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes orb2 {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(-70px, 60px) scale(0.9); }
          66%  { transform: translate(50px, -40px) scale(1.15); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes orb3 {
          0%   { transform: translate(0px, 0px) scale(1); }
          50%  { transform: translate(-50px, -60px) scale(1.05); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes gridMove {
          0%   { transform: translate(0px, 0px); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes streak {
          0%   { opacity: 0; transform: translateY(-100%); }
          30%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(300%); }
        }
      `}</style>

      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Moving grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(56,189,248,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            animation: "gridMove 8s linear infinite"
          }} />

        {/* Orb 1 — cyan, top-left */}
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.05) 55%, transparent 100%)", animation: "orb1 14s ease-in-out infinite" }} />

        {/* Orb 2 — violet, center */}
        <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.04) 60%, transparent 100%)", animation: "orb2 18s ease-in-out infinite", animationDelay: "-6s" }} />

        {/* Orb 3 — teal, bottom-right */}
        <div className="absolute -bottom-20 right-[-80px] w-[550px] h-[550px] rounded-full blur-[150px]"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.14) 0%, rgba(20,184,166,0.04) 60%, transparent 100%)", animation: "orb3 22s ease-in-out infinite", animationDelay: "-10s" }} />

        {/* Falling streaks */}
        {[
          { left: "12%", delay: "0s",   dur: "6s",  color: "rgba(56,189,248,0.4)",   h: "120px" },
          { left: "28%", delay: "2.5s", dur: "8s",  color: "rgba(139,92,246,0.35)",  h: "80px"  },
          { left: "55%", delay: "1s",   dur: "7s",  color: "rgba(56,189,248,0.3)",   h: "100px" },
          { left: "72%", delay: "4s",   dur: "9s",  color: "rgba(20,184,166,0.35)",  h: "90px"  },
          { left: "88%", delay: "1.5s", dur: "6.5s",color: "rgba(139,92,246,0.25)", h: "70px"  },
        ].map((s, i) => (
          <div key={i} className="absolute top-0 w-[1px]"
            style={{
              left: s.left,
              height: s.h,
              background: `linear-gradient(to bottom, transparent, ${s.color}, transparent)`,
              animation: `streak ${s.dur} ease-in-out infinite`,
              animationDelay: s.delay,
            }} />
        ))}
      </div>

      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-10 relative z-10 border-r border-white/[0.05]">
        <Link to="/" className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-300 transition-colors w-fit group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Volver al inicio
        </Link>

        <div className="space-y-8">
          {/* Logo / Headline */}
          <div>
            <h1 className="text-5xl font-black tracking-tight leading-none mb-3">
              <span className="text-white">Orion</span>
              <span className="bg-gradient-to-r from-cyan-400 via-primary to-violet-400 bg-clip-text text-transparent"> Builder</span>
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px]">
              Construye aplicaciones completas con inteligencia artificial. Rápido, flexible y potente.
            </p>
          </div>

          {/* Feature pills — compact */}
          <div className="space-y-2.5">
            {[
              { icon: Zap, label: "Editor en tiempo real", desc: "Previsualiza tu código al instante", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
              { icon: Bot, label: "IA integrada", desc: "Asistente que entiende tu proyecto", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/20" },
              { icon: Users, label: "Comunidad activa", desc: "Miles de componentes listos", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200 group cursor-default backdrop-blur-sm">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${item.bg}`}>
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors leading-none mb-0.5">{item.label}</p>
                  <p className="text-[11px] text-zinc-600 leading-none">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        <p className="text-xs text-zinc-800">© 2026 Orion Builder. Todos los derechos reservados.</p>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        <Link to="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Bienvenido de vuelta</h2>
            <p className="text-zinc-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 h-10 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <GoogleIcon />
              Google
            </button>
            <button
              type="button"
              onClick={handleGitHubLogin}
              className="flex items-center justify-center gap-2 h-10 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.02]">
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600 whitespace-nowrap">o continúa con email</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-400 text-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-600 h-10 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-400 text-xs font-medium">Contraseña</Label>
                <button
                  type="button"
                  onClick={() => setRecoveryOpen(true)}
                  className="text-xs text-zinc-600 hover:text-primary transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-900/80 border-zinc-800 text-white h-10 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-colors"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all hover:scale-[1.01]"
              disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-zinc-400 hover:text-primary transition-colors font-medium">
              Registrarse
            </Link>
          </p>
        </div>
      </div>

      {/* Password Recovery Modal */}
      <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
        <DialogContent className="sm:max-w-sm bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Recuperar contraseña</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Te enviaremos un enlace para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordRecovery} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="recovery-email" className="text-zinc-400 text-xs">Email</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="tu@email.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setRecoveryOpen(false)} className="flex-1 rounded-xl border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 rounded-xl bg-primary hover:bg-primary/90">
                {isLoading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
