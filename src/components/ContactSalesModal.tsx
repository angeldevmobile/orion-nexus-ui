import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Mail, Phone, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactSalesModal({ open, onOpenChange }: ContactSalesModalProps) {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "¡Solicitud enviada!",
      description: "Nuestro equipo de ventas se pondrá en contacto contigo en menos de 24 horas.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Contactar Equipo de Ventas
          </DialogTitle>
          <DialogDescription className="text-base">
            Completa el formulario y nos pondremos en contacto contigo para una demostración personalizada del plan Enterprise
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 my-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <Mail className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground">ventas@lovable.dev</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <Phone className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Teléfono</h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Horario</h3>
              <p className="text-sm text-muted-foreground">Lun - Vie, 9AM - 6PM</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    required
                    className="transition-all focus:scale-[1.01]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    placeholder="Pérez"
                    required
                    className="transition-all focus:scale-[1.01]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Corporativo *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@empresa.com"
                    required
                    className="transition-all focus:scale-[1.01]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    required
                    className="transition-all focus:scale-[1.01]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa *</Label>
                  <Input
                    id="company"
                    placeholder="Nombre de tu empresa"
                    required
                    className="transition-all focus:scale-[1.01]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Input
                    id="position"
                    placeholder="Director de Tecnología"
                    required
                    className="transition-all focus:scale-[1.01]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Tamaño del Equipo *</Label>
                  <Select required>
                    <SelectTrigger id="teamSize" className="transition-all focus:scale-[1.01]">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 empleados</SelectItem>
                      <SelectItem value="11-50">11-50 empleados</SelectItem>
                      <SelectItem value="51-200">51-200 empleados</SelectItem>
                      <SelectItem value="201-500">201-500 empleados</SelectItem>
                      <SelectItem value="500+">500+ empleados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria *</Label>
                  <Select required>
                    <SelectTrigger id="industry" className="transition-all focus:scale-[1.01]">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Tecnología</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                      <SelectItem value="healthcare">Salud</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="other">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Cuéntanos sobre tu proyecto *</Label>
                <Textarea
                  id="message"
                  placeholder="Describe tus necesidades, objetivos y cómo el plan Enterprise puede ayudar a tu equipo..."
                  required
                  className="min-h-[120px] transition-all focus:scale-[1.01]"
                />
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">¿Qué incluye el plan Enterprise?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Créditos IA ilimitados para tu equipo</li>
                  <li>• SSO y seguridad empresarial avanzada</li>
                  <li>• Gestión centralizada de equipos</li>
                  <li>• SLA garantizado del 99.9%</li>
                  <li>• Soporte dedicado 24/7 con respuesta prioritaria</li>
                  <li>• Capacitación personalizada para tu equipo</li>
                  <li>• Opción de despliegue on-premise</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 transition-all hover:scale-[1.02]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02]"
                >
                  Enviar Solicitud
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4 border-t">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Respuesta en menos de 24 horas • Información confidencial</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
