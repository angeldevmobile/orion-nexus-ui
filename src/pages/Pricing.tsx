import { IconSidebar } from "@/components/layout/IconSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Building2, Sparkles, Info } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { ContactSalesModal } from "@/components/ContactSalesModal";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/service/ApiService";

interface CreditStatus {
  dailyRemaining: number;
  dailyLimit: number;
  monthlyRemaining: number;
  monthlyLimit: number;
  dailyResetAt: string;
  monthlyResetAt: string;
  plan: string;
}

interface ProfileResponse {
  success: boolean;
  data: {
    role: string;
    preferences?: { subscription?: string };
    credits: CreditStatus | null;
  };
}

const ANNUAL_DISCOUNT = 0.2;

const plans = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    monthlyPrice: 0,
    description: "Para explorar y comenzar a construir.",
    badge: null,
    cta: "Tu plan actual",
    ctaVariant: "outline" as const,
    highlight: false,
    inheritsFrom: null,
    features: [
      { label: "3 proyectos activos" },
      { label: "5 créditos IA por día" },
      { label: "Editor de código básico" },
      { label: "Componentes esenciales" },
      { label: "Plantillas de la comunidad" },
      { label: "Exportar código fuente" },
      { label: "Soporte comunitario" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    monthlyPrice: 20,
    description: "Para desarrolladores que construyen proyectos reales.",
    badge: "Más Popular",
    cta: "Actualizar a Pro",
    ctaVariant: "default" as const,
    highlight: true,
    inheritsFrom: "Free",
    features: [
      { label: "Proyectos ilimitados" },
      { label: "20 créditos IA por día (hasta 600/mes)", info: true },
      { label: "AI Chat avanzado" },
      { label: "Editor Monaco completo" },
      { label: "Historial de versiones" },
      { label: "Soporte prioritario" },
      { label: "Publicar proyectos en comunidad" },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: Building2,
    monthlyPrice: 45,
    description: "Controles avanzados para equipos en crecimiento.",
    badge: null,
    cta: "Actualizar a Business",
    ctaVariant: "outline" as const,
    highlight: false,
    inheritsFrom: "Pro",
    features: [
      { label: "Todo lo de Pro" },
      { label: "60 créditos IA por día (hasta 1,800/mes)", info: true },
      { label: "Gestión de equipos" },
      { label: "Proyectos privados" },
      { label: "Integraciones premium" },
      { label: "Soporte 24/7" },
      { label: "Panel de administración" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Sparkles,
    monthlyPrice: null,
    description: "Diseñado para grandes organizaciones que necesitan flexibilidad y gobernanza.",
    badge: null,
    cta: "Reservar una demostración",
    ctaVariant: "outline" as const,
    highlight: false,
    inheritsFrom: "Business",
    features: [
      { label: "Todo lo de Business" },
      { label: "Créditos IA según volumen" },
      { label: "SSO (Single Sign-On)" },
      { label: "SLA garantizado" },
      { label: "Despliegue on-premise" },
      { label: "Capacitación personalizada" },
      { label: "Soporte dedicado" },
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: "", price: "", billing: "monthly" as "monthly" | "annual" });
  const [credits, setCredits] = useState<CreditStatus | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const { toast } = useToast();

  useEffect(() => {
    apiService.get<ProfileResponse>("/auth/profile")
      .then((res) => {
        if (res.data?.credits) setCredits(res.data.credits);
        const sub = res.data?.preferences?.subscription ?? res.data?.credits?.plan ?? "free";
        setCurrentPlan(sub.toLowerCase());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const plan = params.get("plan");
    if (payment === "success" && plan) {
      toast({
        title: "¡Pago exitoso!",
        description: `Tu suscripción al plan ${plan.charAt(0).toUpperCase() + plan.slice(1)} ha sido activada.`,
      });
    } else if (payment === "cancelled") {
      toast({
        title: "Pago cancelado",
        description: "No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.",
        variant: "destructive",
      });
    }
    if (payment) window.history.replaceState({}, "", window.location.pathname);
  }, [toast]);

  const handlePlanClick = (plan: typeof plans[number]) => {
    if (plan.id === "enterprise") {
      setContactSalesOpen(true);
      return;
    }
    if (plan.id === "free" || plan.id === currentPlan) return;

    const rawPrice = plan.monthlyPrice!;
    const finalPrice = annual ? Math.round(rawPrice * (1 - ANNUAL_DISCOUNT)) : rawPrice;
    setSelectedPlan({
      name: plan.name,
      price: String(finalPrice),
      billing: annual ? "annual" : "monthly",
    });
    setPaymentModalOpen(true);
  };

  const getDisplayPrice = (plan: typeof plans[number]) => {
    if (plan.monthlyPrice === null) return null;
    if (plan.monthlyPrice === 0) return 0;
    return annual ? Math.round(plan.monthlyPrice * (1 - ANNUAL_DISCOUNT)) : plan.monthlyPrice;
  };

  const hoursUntilReset = credits?.dailyResetAt
    ? Math.max(0, Math.round((new Date(credits.dailyResetAt).getTime() - Date.now()) / 3_600_000))
    : null;

  const dailyUsed = credits ? credits.dailyLimit - credits.dailyRemaining : 0;
  const dailyPct = credits && credits.dailyLimit > 0
    ? Math.round((dailyUsed / credits.dailyLimit) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <IconSidebar />
        <main className="flex-1 ml-14 p-8">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-heading font-bold mb-3">Planes y Precios</h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Elige el plan que se adapta a tu ritmo de construcción.
              </p>

              {/* Billing toggle */}
              <div className="inline-flex items-center gap-3 mt-6 bg-secondary/50 border border-border rounded-full px-4 py-2">
                <span className={`text-sm font-medium transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
                  Mensual
                </span>
                <button
                  role="switch"
                  aria-checked={annual}
                  onClick={() => setAnnual((v) => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${annual ? "bg-primary" : "bg-border"}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${annual ? "translate-x-4" : "translate-x-0"}`}
                  />
                </button>
                <span className={`text-sm font-medium transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}>
                  Anual
                </span>
                {annual && (
                  <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs px-2">
                    20% descuento
                  </Badge>
                )}
              </div>
            </div>

            {/* Usage card */}
            {credits && (
              <div className="mb-10 p-5 rounded-xl border border-border bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Plan actual: <span className="text-primary capitalize">{currentPlan}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Créditos IA usados hoy: {dailyUsed} / {credits.dailyLimit}
                      {hoursUntilReset !== null && ` · se reinician en ${hoursUntilReset}h`}
                    </p>
                  </div>
                  <div className="w-full sm:w-64">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${dailyPct > 80 ? "bg-red-500" : "bg-primary"}`}
                        style={{ width: `${Math.max(dailyPct, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-12">
              {plans.map((plan) => {
                const displayPrice = getDisplayPrice(plan);
                const isCurrentPlan = plan.id === currentPlan;
                const Icon = plan.icon;

                return (
                  <Card
                    key={plan.id}
                    className={`relative flex flex-col transition-all duration-300 ${
                      plan.highlight
                        ? "border-primary/60 shadow-lg shadow-primary/15 bg-gradient-to-b from-primary/5 to-card"
                        : "border-border bg-card hover:border-border/80"
                    } ${isCurrentPlan ? "ring-1 ring-primary/30" : ""}`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs shadow-md shadow-primary/30">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    {isCurrentPlan && !plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-secondary border border-border text-muted-foreground px-3 py-0.5 text-xs">
                          Plan actual
                        </Badge>
                      </div>
                    )}

                    <CardContent className="pt-8 pb-6 px-5 flex flex-col flex-1 gap-5">
                      {/* Plan header */}
                      <div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${plan.highlight ? "bg-primary/20 border border-primary/30" : "bg-secondary border border-border"}`}>
                          <Icon className={`w-5 h-5 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <h2 className="text-xl font-heading font-bold">{plan.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1 leading-snug">{plan.description}</p>
                      </div>

                      {/* Price */}
                      <div>
                        {displayPrice === null ? (
                          <div>
                            <p className="text-2xl font-heading font-bold">Platform fee</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-snug">
                              Basado en el tamaño de tu organización
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-heading font-bold">${displayPrice}</span>
                              <span className="text-sm text-muted-foreground">por mes</span>
                            </div>
                            {annual && displayPrice > 0 && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                facturado anualmente (${displayPrice * 12}/año)
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <Button
                        onClick={() => handlePlanClick(plan)}
                        disabled={isCurrentPlan && plan.id !== "enterprise"}
                        variant={plan.highlight ? "default" : "outline"}
                        className={`w-full ${plan.highlight ? "bg-primary hover:bg-primary/90 shadow-md shadow-primary/25" : ""} ${isCurrentPlan ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {isCurrentPlan && plan.id !== "enterprise" ? "Plan actual" : plan.cta}
                      </Button>

                      {/* Features */}
                      <div className="flex-1">
                        {plan.inheritsFrom && (
                          <p className="text-xs text-muted-foreground mb-3 font-medium">
                            Todo lo de {plan.inheritsFrom}, además de:
                          </p>
                        )}
                        <ul className="space-y-2.5">
                          {plan.features.map((f) => (
                            <li key={f.label} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground leading-snug flex items-center gap-1">
                                {f.label}
                                {f.info && <Info className="w-3 h-3 text-muted-foreground/50 shrink-0" />}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Payment methods */}
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span>Métodos de pago aceptados:</span>
              {["💳 Visa", "💳 Mastercard", "💳 American Express"].map((m) => (
                <span key={m} className="px-3 py-1 rounded-lg bg-secondary border border-border text-xs font-medium">
                  {m}
                </span>
              ))}
            </div>

          </div>
        </main>
      </div>

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        planName={selectedPlan.name}
        planPrice={selectedPlan.price}
        billing={selectedPlan.billing}
      />

      <ContactSalesModal
        open={contactSalesOpen}
        onOpenChange={setContactSalesOpen}
      />
    </div>
  );
}
