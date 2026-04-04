import { IconSidebar } from "@/components/layout/IconSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { ContactSalesModal } from "@/components/ContactSalesModal";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: "", price: "" });
  const { toast } = useToast();

  // Detectar redirect de Stripe Checkout (success o cancelled)
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

    // Limpiar query params de la URL sin recargar la página
    if (payment) {
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    }
  }, [toast]);

  const handlePlanClick = (planName: string, planPrice: string) => {
    if (planName === "Free") return;
    setSelectedPlan({ name: planName, price: planPrice });
    setPaymentModalOpen(true);
  };

  const plans = [
    {
      name: "Free",
      icon: Zap,
      price: "0",
      description: "Perfecto para comenzar y probar",
      features: [
        "3 proyectos",
        "100 créditos IA/mes",
        "Componentes básicos",
        "Exportar código",
        "Soporte comunitario",
      ],
      cta: "Comenzar gratis",
      popular: false,
    },
    {
      name: "Pro",
      icon: Crown,
      price: "29",
      description: "Para desarrolladores profesionales",
      features: [
        "Proyectos ilimitados",
        "1,000 créditos IA/mes",
        "Todos los componentes",
        "Deploy automático",
        "Editor avanzado",
        "Soporte prioritario",
        "Colaboración en tiempo real",
        "Integraciones premium",
      ],
      cta: "Actualizar a Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      icon: Building2,
      price: "99",
      description: "Para equipos y empresas",
      features: [
        "Todo de Pro",
        "Créditos IA ilimitados",
        "SSO y seguridad avanzada",
        "Gestión de equipos",
        "SLA garantizado",
        "Soporte dedicado 24/7",
        "Capacitación personalizada",
        "Despliegue on-premise",
      ],
      cta: "Actualizar a Enterprise",
      popular: false,
    },
  ];

  const usageStats = [
    { label: "Créditos usados", value: "234", total: "1,000", percentage: 23 },
    { label: "Proyectos activos", value: "8", total: "∞", percentage: 0 },
    { label: "Generaciones IA", value: "156", total: "300", percentage: 52 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <IconSidebar />
        <main className="flex-1 ml-14 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-heading font-bold mb-4">
                Planes y Precios
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Elige el plan perfecto para tus necesidades
              </p>
            </div>

            {/* Current Usage */}
            <Card className="bg-card border-border mb-12">
              <CardHeader>
                <CardTitle>Uso Actual - Plan Pro</CardTitle>
                <CardDescription>Tu consumo este mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {usageStats.map((stat) => (
                    <div key={stat.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{stat.label}</span>
                        <span className="font-medium">
                          {stat.value} / {stat.total}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: stat.percentage > 0 ? `${stat.percentage}%` : "5%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className="relative bg-card border-primary/50 shadow-lg shadow-primary/10 hover:border-primary transition-all"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Más Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <plan.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handlePlanClick(plan.name, plan.price)}
                      disabled={plan.name === "Free"}
                      className="w-full bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {plan.cta}
                    </Button>

                    {plan.name === "Enterprise" && (
                      <button
                        onClick={() => setContactSalesOpen(true)}
                        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 mt-1"
                      >
                        ¿Precios personalizados? Hablar con ventas
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payment Methods */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>Aceptamos los siguientes métodos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {["💳 Visa", "💳 Mastercard", "💳 American Express"].map((method) => (
                    <div key={method} className="px-4 py-2 rounded-lg bg-secondary border border-border">
                      <span className="text-sm font-medium">{method}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        planName={selectedPlan.name}
        planPrice={selectedPlan.price}
      />

      <ContactSalesModal
        open={contactSalesOpen}
        onOpenChange={setContactSalesOpen}
      />
    </div>
  );
}
