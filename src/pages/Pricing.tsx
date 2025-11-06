import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { ContactSalesModal } from "@/components/ContactSalesModal";
import { useState } from "react";

export default function Pricing() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: "", price: "" });

  const handlePlanClick = (planName: string, planPrice: string) => {
    if (planName === "Enterprise") {
      setContactSalesOpen(true);
    } else {
      setSelectedPlan({ name: planName, price: planPrice });
      setPaymentModalOpen(true);
    }
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
      cta: "Contactar ventas",
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
        <Sidebar />
        <main className="flex-1 ml-64 p-8 pt-24">
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
                      className="w-full bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
                    >
                      {plan.cta}
                    </Button>
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
                  {["💳 Tarjeta de Crédito", "🏦 Transferencia Bancaria", "💰 PayPal", "🔷 Stripe"].map((method) => (
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
