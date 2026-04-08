import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/service/ApiService";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  planPrice: string;
  billing?: "monthly" | "annual";
}

export function PaymentModal({ open, onOpenChange, planName, planPrice, billing = "monthly" }: PaymentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const checkoutOpened = useRef(false);

  const isAnnual = billing === "annual";
  const annualTotal = isAnnual ? Number(planPrice) * 12 : null;

  const handleCheckout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await apiService.post<{ success: boolean; data: { checkoutUrl: string } }>("/payments/checkout", {
        planName,
        billing,
      });
      const url = res.data?.checkoutUrl;
      if (!url) throw new Error("No se recibió URL de checkout");

      // Abrir checkout de Lemon Squeezy como página completa
      onOpenChange(false);
      window.location.href = url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo iniciar el checkout.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm p-0 gap-0 border border-slate-700 bg-slate-900 rounded-xl overflow-hidden"
        onFocusOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Suscripción Plan {planName}</DialogTitle>
        <DialogDescription className="sr-only">
          Activa el Plan {planName} por ${planPrice}/mes con Lemon Squeezy.
        </DialogDescription>

        {/* Cabecera */}
        <div className="px-5 pt-4 pb-3 pr-12 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold text-blue-400 uppercase tracking-widest mb-0.5">
                Suscripción {isAnnual ? "Anual" : "Mensual"}
              </p>
              <h2 className="text-sm font-bold text-white leading-tight">Plan {planName}</h2>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {isAnnual
                  ? `$${planPrice}/mes · facturado $${annualTotal}/año`
                  : `$${planPrice}/mes · Cancela cuando quieras`}
              </p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-xl font-bold text-white leading-none">${planPrice}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">por mes</p>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Qué incluye */}
          <ul className="space-y-2 text-[12px] text-slate-300">
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Pago seguro procesado por Lemon Squeezy
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Acepta tarjetas de crédito/débito y PayPal
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
              Cancela en cualquier momento desde tu cuenta
            </li>
          </ul>

          {/* Botón */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </>
            ) : isAnnual ? (
              <>🔒 Pagar ${annualTotal} / año</>
            ) : (
              <>🔒 Pagar ${planPrice} / mes</>
            )}
          </button>

          {/* Badges */}
          <div className="flex items-center justify-center gap-3 pt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-500">Cifrado SSL</span>
            <span className="text-slate-600">·</span>
            <span className="text-[10px] text-slate-500">Sin guardar datos</span>
            <span className="text-slate-600">·</span>
            <span className="text-[10px] text-slate-500">Reembolso 30 días</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


