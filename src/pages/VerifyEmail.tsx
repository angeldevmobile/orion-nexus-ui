import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react";
import { apiService } from "@/service/ApiService";

type Status = "loading" | "success" | "error" | "no-token";

export default function VerifyEmail() {
  const [status, setStatus] = useState<Status>("loading");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    apiService
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

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
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>

      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(56,189,248,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.8) 1px, transparent 1px)", backgroundSize: "60px 60px", animation: "gridMove 8s linear infinite" }} />
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.05) 55%, transparent 100%)", animation: "orb1 14s ease-in-out infinite" }} />
        <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.04) 60%, transparent 100%)", animation: "orb2 18s ease-in-out infinite", animationDelay: "-6s" }} />
        <div className="absolute -bottom-20 right-[-80px] w-[550px] h-[550px] rounded-full blur-[150px]"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.14) 0%, rgba(20,184,166,0.04) 60%, transparent 100%)", animation: "orb3 22s ease-in-out infinite", animationDelay: "-10s" }} />
        {[
          { left: "12%", delay: "0s",   dur: "6s",   color: "rgba(56,189,248,0.4)",  h: "120px" },
          { left: "55%", delay: "1s",   dur: "7s",   color: "rgba(56,189,248,0.3)",  h: "100px" },
          { left: "88%", delay: "1.5s", dur: "6.5s", color: "rgba(139,92,246,0.25)", h: "70px"  },
        ].map((s, i) => (
          <div key={i} className="absolute top-0 w-[1px]"
            style={{ left: s.left, height: s.h, background: `linear-gradient(to bottom, transparent, ${s.color}, transparent)`, animation: `streak ${s.dur} ease-in-out infinite`, animationDelay: s.delay }} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        <div className="w-full max-w-[400px] text-center">

          {/* Loading */}
          {status === "loading" && (
            <div className="space-y-5">
              <div className="relative flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Loader2 className="w-9 h-9 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Verificando tu email...</h2>
                <p className="text-zinc-500 text-sm mt-2">Esto solo tomara un momento.</p>
              </div>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="space-y-6">
              <div className="relative flex justify-center">
                <div className="absolute w-20 h-20 rounded-full bg-green-500/20 animate-[pulse-ring_1.5s_ease-out_infinite]" />
                <div className="relative w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-green-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Email verificado</h2>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                  Tu cuenta esta activada y lista para usar. Ahora puedes acceder a todas las funciones de Orion Builder.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <Link to="/dashboard">
                  <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all hover:scale-[1.01]">
                    Ir al Dashboard
                  </Button>
                </Link>
                <Link to="/login" className="block text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
                  o iniciar sesion
                </Link>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <XCircle className="w-9 h-9 text-red-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Enlace invalido</h2>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                  El enlace de verificacion es invalido o ya fue usado. Si tu cuenta sigue sin verificarse, contacta a soporte.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <Link to="/login">
                  <Button className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium">
                    Ir al Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* No token */}
          {status === "no-token" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <MailCheck className="w-9 h-9 text-zinc-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Verifica tu email</h2>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                  Revisa tu bandeja de entrada y haz clic en el enlace que te enviamos al registrarte.
                </p>
              </div>
              <Link to="/login">
                <Button variant="outline" className="w-full h-10 rounded-xl border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  Volver al Login
                </Button>
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
