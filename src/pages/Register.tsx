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
import { Github, ArrowLeft, ShieldCheck, FileText, Zap, Bot, Users } from "lucide-react";
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

type BackendError = {
  message?: string;
  errors?: { msg?: string; message?: string }[];
};

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleGitHubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/github`;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({
        title: "Contrasena demasiado corta",
        description: "La contrasena debe tener al menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.register({ username, email, password });
      login(response.token, response.user);
      toast({ title: "Cuenta creada!", description: "Tu cuenta ha sido creada exitosamente" });
      navigate("/dashboard");
    } catch (error) {
      const err = error as BackendError;
      let description = "Error al crear la cuenta";
      if (err.message) description = err.message;
      if (err.errors && Array.isArray(err.errors))
        description = err.errors.map((e) => e.msg || e.message).join("\n");
      toast({ title: "Error al crear cuenta", description, variant: "destructive" });
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

        {/* Orb 1 — cyan, top-right */}
        <div className="absolute -top-40 -right-40 w-[650px] h-[650px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.05) 55%, transparent 100%)", animation: "orb1 14s ease-in-out infinite" }} />

        {/* Orb 2 — violet, center */}
        <div className="absolute top-[30%] left-[30%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.04) 60%, transparent 100%)", animation: "orb2 18s ease-in-out infinite", animationDelay: "-6s" }} />

        {/* Orb 3 — teal, bottom-left */}
        <div className="absolute -bottom-20 -left-20 w-[550px] h-[550px] rounded-full blur-[150px]"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.14) 0%, rgba(20,184,166,0.04) 60%, transparent 100%)", animation: "orb3 22s ease-in-out infinite", animationDelay: "-10s" }} />

        {/* Falling streaks */}
        {[
          { left: "8%",  delay: "0s",   dur: "6s",   color: "rgba(56,189,248,0.4)",  h: "120px" },
          { left: "25%", delay: "2.5s", dur: "8s",   color: "rgba(139,92,246,0.35)", h: "80px"  },
          { left: "50%", delay: "1s",   dur: "7s",   color: "rgba(56,189,248,0.3)",  h: "100px" },
          { left: "70%", delay: "4s",   dur: "9s",   color: "rgba(20,184,166,0.35)", h: "90px"  },
          { left: "90%", delay: "1.5s", dur: "6.5s", color: "rgba(139,92,246,0.25)", h: "70px"  },
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

      {/* LEFT PANEL - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        <Link to="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Crear cuenta nueva</h2>
            <p className="text-zinc-500 text-sm mt-1">Comienza gratis y escala con tu proyecto</p>
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
            <span className="text-xs text-zinc-600 whitespace-nowrap">o registrate con email</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-zinc-400 text-xs font-medium">Nombre de usuario</Label>
              <Input
                id="username"
                placeholder="juanperez"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-600 h-10 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-colors"
              />
            </div>

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
              <Label htmlFor="password" className="text-zinc-400 text-xs font-medium">Contrasena</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-600 h-10 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-colors"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all hover:scale-[1.01]"
              disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <p className="text-xs text-center text-zinc-700 mt-4 leading-relaxed">
            Al registrarte, aceptas nuestros{" "}
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="text-zinc-500 hover:text-primary transition-colors underline underline-offset-2">
              Terminos de Servicio
            </button>{" "}
            y{" "}
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="text-zinc-500 hover:text-primary transition-colors underline underline-offset-2">
              Politica de Privacidad
            </button>
          </p>

          <p className="text-center text-sm text-zinc-600 mt-5">
            Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-zinc-400 hover:text-primary transition-colors font-medium">
              Iniciar Sesion
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-10 relative z-10 border-l border-white/[0.05]">
        <Link to="/" className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-300 transition-colors w-fit ml-auto group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Volver al inicio
        </Link>

        <div className="space-y-8">
          {/* Headline */}
          <div>
            <h2 className="text-5xl font-black tracking-tight leading-none mb-3">
              <span className="text-white">Orion</span>
              <span className="bg-gradient-to-r from-cyan-400 via-primary to-violet-400 bg-clip-text text-transparent"> Builder</span>
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px]">
              Elige el plan que se adapta a tu equipo. Escala cuando lo necesites, paga solo por lo que usas.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-2.5">
            {[
              { icon: Zap,   label: "Editor en tiempo real", desc: "Previsualiza tu código al instante",   color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
              { icon: Bot,   label: "IA integrada",          desc: "Asistente que entiende tu proyecto",  color: "text-sky-400",    bg: "bg-sky-400/10 border-sky-400/20"    },
              { icon: Users, label: "Comunidad activa",      desc: "Miles de componentes listos",         color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
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

          {/* Trust badges */}
          <div className="space-y-2.5 pt-1">
            {[
              { icon: ShieldCheck, text: "Datos cifrados con TLS 1.3 y AES-256" },
              { icon: FileText,    text: "Cumple con GDPR y estándares de privacidad" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-zinc-700 shrink-0" />
                <p className="text-xs text-zinc-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-800">© 2026 Orion Builder. Todos los derechos reservados.</p>
      </div>

      {/* Terms of Service Modal */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Terminos de Servicio
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Ultima actualizacion: 5 de abril de 2026
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 text-sm text-zinc-400 mt-2">
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">1. Aceptacion de los terminos</h3>
              <p>Al crear una cuenta en Orion Builder, aceptas quedar vinculado por estos Terminos de Servicio. Si no estas de acuerdo con alguna parte de estos terminos, no podras acceder al servicio.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">2. Descripcion del servicio</h3>
              <p>Orion Builder es una plataforma de desarrollo asistida por inteligencia artificial que permite a los usuarios crear, editar y publicar aplicaciones y proyectos de software. El servicio incluye un editor de codigo en tiempo real, asistente IA, biblioteca de componentes y comunidad de desarrolladores.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">3. Cuentas de usuario</h3>
              <p>Eres responsable de mantener la confidencialidad de tu cuenta y contrasena. Debes notificarnos inmediatamente sobre cualquier uso no autorizado. Debes proporcionar informacion veridica al registrarte y mantenerla actualizada.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">4. Uso aceptable</h3>
              <p>No puedes usar Orion Builder para: generar contenido malicioso o ilegal, realizar ingenieria inversa del sistema, vender o redistribuir acceso a la plataforma sin autorizacion, o vulnerar los derechos de propiedad intelectual de terceros.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">5. Creditos y pagos</h3>
              <p>El servicio opera bajo un sistema de creditos para el uso de funciones de IA. Los creditos comprados no son reembolsables excepto en los casos establecidos por la ley aplicable. Los planes de suscripcion se renuevan automaticamente salvo que se cancelen antes de la fecha de renovacion.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">6. Propiedad intelectual</h3>
              <p>El codigo y los proyectos que creas en Orion Builder son de tu propiedad. Orion Builder retiene todos los derechos sobre la plataforma, su tecnologia y marca. Al usar el servicio, nos otorgas una licencia limitada para procesar tu contenido con el fin de prestarte el servicio.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">7. Limitacion de responsabilidad</h3>
              <p>Orion Builder se proporciona "tal cual". No garantizamos que el servicio sea ininterrumpido o libre de errores. En ningun caso seremos responsables de danos indirectos, incidentales o consecuentes derivados del uso de la plataforma.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">8. Contacto</h3>
              <p>Para consultas sobre estos terminos, contacta a <span className="text-primary">legal@orionbuilder.io</span></p>
            </section>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <Button onClick={() => setTermsOpen(false)} className="w-full rounded-xl bg-primary hover:bg-primary/90">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Politica de Privacidad
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Ultima actualizacion: 5 de abril de 2026
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 text-sm text-zinc-400 mt-2">
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">1. Informacion que recopilamos</h3>
              <p>Recopilamos informacion que proporcionas directamente: nombre de usuario, direccion de email, contrasena cifrada. Al usar OAuth (GitHub) obtenemos tu perfil publico. Tambien recopilamos datos de uso como proyectos creados, creditos consumidos y preferencias de configuracion.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">2. Como usamos tu informacion</h3>
              <p>Utilizamos tus datos para: operar y mejorar la plataforma, personalizar tu experiencia de usuario, procesar pagos y gestionar creditos, enviarte notificaciones importantes del servicio, y detectar y prevenir fraudes o usos indebidos.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">3. Almacenamiento y seguridad</h3>
              <p>Tus datos se almacenan en servidores protegidos con cifrado AES-256. Las conexiones utilizan TLS 1.3. Las contrasenas se almacenan con hash bcrypt. Realizamos copias de seguridad diarias y auditorias de seguridad periodicas.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">4. Compartir con terceros</h3>
              <p>No vendemos tus datos personales. Compartimos informacion unicamente con: proveedores de servicios necesarios para operar la plataforma (procesadores de pago, infraestructura cloud), cuando sea requerido por ley, o con tu consentimiento explicito. La integracion con GitHub OAuth esta gobernada por la politica de privacidad de GitHub.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">5. Tus derechos</h3>
              <p>Tienes derecho a: acceder a tus datos personales, corregir informacion incorrecta, solicitar la eliminacion de tu cuenta y datos, exportar tu informacion en formato portatil, y oponerte al procesamiento de tus datos con fines de marketing.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">6. Cookies</h3>
              <p>Utilizamos cookies de sesion para mantener tu inicio de sesion y cookies de preferencias para recordar tu configuracion. No utilizamos cookies de rastreo de terceros con fines publicitarios.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">7. Retencion de datos</h3>
              <p>Conservamos tus datos mientras tu cuenta este activa. Al eliminar tu cuenta, borramos tus datos personales en un plazo de 30 dias, excepto cuando la ley requiera conservarlos por mas tiempo.</p>
            </section>
            <section className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-base">8. Contacto</h3>
              <p>Para ejercer tus derechos o consultas de privacidad: <span className="text-primary">privacy@orionbuilder.io</span></p>
            </section>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <Button onClick={() => setPrivacyOpen(false)} className="w-full rounded-xl bg-primary hover:bg-primary/90">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
