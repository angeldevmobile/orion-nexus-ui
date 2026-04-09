import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/service/AuthService";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Asegúrate de escribir la misma contraseña en ambos campos.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ token: token!, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      toast({
        title: "Error al restablecer contraseña",
        description: error instanceof Error ? error.message : "El enlace puede haber expirado. Solicita uno nuevo.",
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
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(56,189,248,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            animation: "gridMove 8s linear infinite"
          }} />
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.05) 55%, transparent 100%)", animation: "orb1 14s ease-in-out infinite" }} />
        <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.04) 60%, transparent 100%)", animation: "orb2 18s ease-in-out infinite", animationDelay: "-6s" }} />
        <div className="absolute -bottom-20 right-[-80px] w-[550px] h-[550px] rounded-full blur-[150px]"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.14) 0%, rgba(20,184,166,0.04) 60%, transparent 100%)", animation: "orb3 22s ease-in-out infinite", animationDelay: "-10s" }} />
        {[
          { left: "12%", delay: "0s",    dur: "6s",   color: "rgba(56,189,248,0.4)",  h: "120px" },
          { left: "28%", delay: "2.5s",  dur: "8s",   color: "rgba(139,92,246,0.35)", h: "80px"  },
          { left: "55%", delay: "1s",    dur: "7s",   color: "rgba(56,189,248,0.3)",  h: "100px" },
          { left: "72%", delay: "4s",    dur: "9s",   color: "rgba(20,184,166,0.35)", h: "90px"  },
          { left: "88%", delay: "1.5s",  dur: "6.5s", color: "rgba(139,92,246,0.25)", h: "70px"  },
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

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        <Link
          to="/login"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Volver al login
        </Link>

        <div className="w-full max-w-[380px]">

          {/* Token invalido */}
          {tokenValid === false && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Enlace inválido</h2>
                <p className="text-zinc-500 text-sm mt-2">
                  Este enlace no es válido o no contiene un token. Por favor solicita un nuevo enlace de recuperación.
                </p>
              </div>
              <Link to="/login">
                <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium mt-2">
                  Ir al login
                </Button>
              </Link>
            </div>
          )}

          {/* Exito */}
          {success && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Contraseña actualizada</h2>
                <p className="text-zinc-500 text-sm mt-2">
                  Tu contraseña fue cambiada correctamente. Serás redirigido al login en unos segundos...
                </p>
              </div>
              <Link to="/login">
                <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium mt-2">
                  Ir al login ahora
                </Button>
              </Link>
            </div>
          )}

          {/* Formulario */}
          {tokenValid === true && !success && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white">Nueva contraseña</h2>
                <p className="text-zinc-500 text-sm mt-1">Elige una contraseña segura de al menos 8 caracteres.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-zinc-400 text-xs font-medium">
                    Nueva contraseña
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-600 h-10 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-zinc-400 text-xs font-medium">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-600 h-10 rounded-xl focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-colors"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all hover:scale-[1.01]"
                  disabled={isLoading || newPassword !== confirmPassword}>
                  {isLoading ? "Guardando..." : "Guardar contraseña"}
                </Button>
              </form>

              <p className="text-center text-sm text-zinc-600 mt-6">
                ¿Recordaste tu contraseña?{" "}
                <Link to="/login" className="text-zinc-400 hover:text-primary transition-colors font-medium">
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
