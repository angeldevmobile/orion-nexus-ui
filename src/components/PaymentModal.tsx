import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeCardNumberElementChangeEvent } from "@stripe/stripe-js";
import { apiService } from "@/service/ApiService";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

// ─── Iconos SVG de red de tarjeta ────────────────────────────────────────────

function VisaIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="38"
      height="24"
      viewBox="0 0 38 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 rounded-sm ${
        active ? "opacity-100" : "opacity-25 grayscale"
      }`}
    >
      <rect width="38" height="24" rx="4" fill="#1A1F71" />
      <text x="19" y="16.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="Arial Black, Arial, sans-serif" letterSpacing="1.5">VISA</text>
    </svg>
  );
}

function MastercardIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="38"
      height="24"
      viewBox="0 0 38 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 rounded-sm ${
        active ? "opacity-100" : "opacity-25 grayscale"
      }`}
    >
      <rect width="38" height="24" rx="4" fill="#252525" />
      <circle cx="15" cy="12" r="7" fill="#EB001B" />
      <circle cx="23" cy="12" r="7" fill="#F79E1B" />
      <path d="M19 6.27a7 7 0 0 1 0 11.46A7 7 0 0 1 19 6.27z" fill="#FF5F00" />
    </svg>
  );
}

// ─── Estilo para campos de Stripe (tema oscuro) ───────────────────────────────

// Fondo del campo: slate-800/60 ≈ #1e293b — igualamos iconColor para ocultarlos
const baseStripeStyle = {
  base: {
    fontSize: "15px",
    color: "#f1f5f9",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSmoothing: "antialiased",
    iconColor: "#1e293b", // invisible sobre el fondo, evita íconos rotos de Stripe
    "::placeholder": { color: "#475569" },
  },
  invalid: { color: "#f87171", iconColor: "#f87171" },
};

const cardNumberOptions = { style: baseStripeStyle, showIcon: false };
const cardExpiryOptions = { style: baseStripeStyle };
const cardCvcOptions    = { style: baseStripeStyle };

// ─── Formulario de tarjeta ────────────────────────────────────────────────────

interface CardFormProps {
  planName: string;
  planPrice: string;
  onSuccess: () => void;
}

function CardPaymentForm({ planName, planPrice, onSuccess }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardBrand, setCardBrand] = useState<string>("");
  const [cardName, setCardName] = useState("");

  const handleCardChange = (e: StripeCardNumberElementChangeEvent) => {
    setCardBrand(e.brand || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const res = await apiService.post<{ success: boolean; data: { clientSecret: string } }>(
        "/payments/create-payment-intent",
        { planName }
      );
      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) throw new Error("Card element not mounted");

      const { error, paymentIntent } = await stripe.confirmCardPayment(res.data.clientSecret, {
        payment_method: { card: cardNumber, billing_details: { name: cardName } },
      });

      if (error) {
        toast({ title: "Error en el pago", description: error.message, variant: "destructive" });
      } else if (paymentIntent?.status === "succeeded") {
        toast({ title: "¡Pago exitoso!", description: `Plan ${planName} activado.` });
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo procesar el pago.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const showVisa       = cardBrand === "visa";
  const showMastercard = cardBrand === "mastercard";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Titular */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-300">Nombre del Titular</Label>
        <Input
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Como aparece en la tarjeta"
          required
          className="h-11 bg-slate-800/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500"
        />
      </div>

      {/* Número de tarjeta con iconos integrados */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-300">Número de Tarjeta</Label>
        <div className="flex h-11 rounded-md border border-slate-700 bg-slate-800/60 px-3 items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <CardNumberElement
            options={cardNumberOptions}
            onChange={handleCardChange}
            className="flex-1 min-w-0"
          />
          {/* Logo de marca detectada — solo aparece al escribir */}
          <div className="flex items-center shrink-0">
            {showVisa       && <VisaIcon active />}
            {showMastercard && <MastercardIcon active />}
          </div>
        </div>
      </div>

      {/* Expiración + CVC */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-300">Vencimiento</Label>
          <div className="flex h-11 rounded-md border border-slate-700 bg-slate-800/60 px-3 items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <CardExpiryElement options={cardExpiryOptions} className="w-full" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-300">CVC</Label>
          <div className="flex h-11 rounded-md border border-slate-700 bg-slate-800/60 px-3 items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <CardCvcElement options={cardCvcOptions} className="w-full" />
          </div>
        </div>
      </div>

      {/* Botón de pago */}
      <Button
        type="submit"
        disabled={loading || !stripe}
        className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white mt-2 transition-all hover:scale-[1.01] disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Procesando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Pagar ${planPrice}/mes
          </span>
        )}
      </Button>

      {/* Badges de seguridad */}
      <div className="flex items-center justify-center gap-4 pt-1">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          Cifrado SSL
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-xs text-slate-500">Procesado por Stripe</span>
        <span className="text-slate-600">·</span>
        <span className="text-xs text-slate-500">Sin guardar datos</span>
      </div>
    </form>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  planPrice: string;
}

export function PaymentModal({ open, onOpenChange, planName, planPrice }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden border-slate-700 bg-slate-900"
        onFocusOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Suscripción Plan {planName}</DialogTitle>
        <DialogDescription className="sr-only">
          Formulario de pago para activar el Plan {planName} a ${planPrice}/mes.
        </DialogDescription>

        {/* Cabecera con gradiente */}
        <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/60">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1">
                Suscripción
              </p>
              <h2 className="text-xl font-bold text-white">Plan {planName}</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                ${planPrice} / mes · Cancela cuando quieras
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">${planPrice}</p>
              <p className="text-xs text-slate-400">por mes</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="px-6 py-5">
          <Elements stripe={stripePromise}>
            <CardPaymentForm
              planName={planName}
              planPrice={planPrice}
              onSuccess={() => onOpenChange(false)}
            />
          </Elements>
        </div>

      </DialogContent>
    </Dialog>
  );
}
