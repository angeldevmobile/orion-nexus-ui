import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Building2, Wallet, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  planPrice: string;
}

export function PaymentModal({ open, onOpenChange, planName, planPrice }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("credit-card");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent, method: string) => {
    e.preventDefault();
    toast({
      title: "¡Pago procesado!",
      description: `Tu suscripción al plan ${planName} ha sido activada con ${method}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl">Completar Pago - Plan {planName}</DialogTitle>
          <DialogDescription>
            Selecciona tu método de pago preferido para activar tu suscripción de ${planPrice}/mes
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedMethod} onValueChange={setSelectedMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="credit-card" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Tarjeta</span>
            </TabsTrigger>
            <TabsTrigger value="bank-transfer" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Banco</span>
            </TabsTrigger>
            <TabsTrigger value="paypal" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">PayPal</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Stripe</span>
            </TabsTrigger>
          </TabsList>

          {/* Credit Card Form */}
          <TabsContent value="credit-card" className="animate-fade-in">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Pago con Tarjeta de Crédito/Débito</CardTitle>
                <CardDescription>Ingresa los datos de tu tarjeta de forma segura</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Tarjeta de Crédito")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Nombre del Titular</Label>
                    <Input
                      id="card-name"
                      placeholder="Juan Pérez"
                      required
                      className="transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-number">Número de Tarjeta</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                      className="transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Fecha de Expiración</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                        className="transition-all focus:scale-[1.02]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        required
                        className="transition-all focus:scale-[1.02]"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]">
                      Pagar ${planPrice}/mes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Transfer Form */}
          <TabsContent value="bank-transfer" className="animate-fade-in">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Transferencia Bancaria</CardTitle>
                <CardDescription>Realiza una transferencia a nuestra cuenta bancaria</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Transferencia Bancaria")} className="space-y-4">
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Banco:</span>
                      <span className="font-medium">Banco Nacional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cuenta:</span>
                      <span className="font-medium">1234-5678-9012</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CLABE:</span>
                      <span className="font-medium">012345678901234567</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Beneficiario:</span>
                      <span className="font-medium">Lovable Platform S.A.</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transfer-name">Nombre Completo</Label>
                    <Input
                      id="transfer-name"
                      placeholder="Tu nombre completo"
                      required
                      className="transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transfer-ref">Número de Referencia</Label>
                    <Input
                      id="transfer-ref"
                      placeholder="REF-123456"
                      required
                      className="transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transfer-date">Fecha de Transferencia</Label>
                    <Input
                      id="transfer-date"
                      type="date"
                      required
                      className="transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]">
                      Confirmar Transferencia
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PayPal Form */}
          <TabsContent value="paypal" className="animate-fade-in">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Pago con PayPal</CardTitle>
                <CardDescription>Conecta con tu cuenta de PayPal de forma segura</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "PayPal")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypal-email">Email de PayPal</Label>
                    <Input
                      id="paypal-email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      className="transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Serás redirigido a PayPal para completar tu pago de forma segura.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span>Conexión segura SSL</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Método de pago en PayPal</Label>
                    <RadioGroup defaultValue="balance">
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value="balance" id="balance" />
                        <Label htmlFor="balance" className="cursor-pointer flex-1">Saldo de PayPal</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value="card" id="pp-card" />
                        <Label htmlFor="pp-card" className="cursor-pointer flex-1">Tarjeta vinculada</Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value="bank" id="pp-bank" />
                        <Label htmlFor="pp-bank" className="cursor-pointer flex-1">Cuenta bancaria</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white transition-all hover:scale-[1.02]">
                      Continuar con PayPal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stripe Form */}
          <TabsContent value="stripe" className="animate-fade-in">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Pago con Stripe</CardTitle>
                <CardDescription>Procesamiento rápido y seguro con Stripe</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, "Stripe")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-email">Email</Label>
                    <Input
                      id="stripe-email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                      className="transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripe-card">Información de Tarjeta</Label>
                    <Input
                      id="stripe-card"
                      placeholder="1234 5678 9012 3456"
                      required
                      className="transition-all focus:scale-[1.02]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-expiry">MM / AA</Label>
                      <Input
                        id="stripe-expiry"
                        placeholder="12 / 25"
                        required
                        className="transition-all focus:scale-[1.02]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-cvc">CVC</Label>
                      <Input
                        id="stripe-cvc"
                        placeholder="123"
                        maxLength={3}
                        required
                        className="transition-all focus:scale-[1.02]"
                      />
                    </div>
                  </div>

                  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-medium">Pago instantáneo</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tu pago será procesado de forma inmediata y segura por Stripe.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-[#635bff] hover:bg-[#5348e8] text-white transition-all hover:scale-[1.02]">
                      Pagar ${planPrice}/mes con Stripe
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4 border-t">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Conexión segura • Tus datos están protegidos</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
