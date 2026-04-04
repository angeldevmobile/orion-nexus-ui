import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Mail, Clock, ShieldCheck } from "lucide-react";
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
      description: "Nuestro equipo se pondrá en contacto contigo en menos de 24 horas.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border border-slate-700 bg-slate-900 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-semibold">Plan Enterprise</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-400 ml-12">
            Cuéntanos sobre tu equipo y te preparamos una propuesta personalizada
          </DialogDescription>
        </div>

        {/* Info rápida */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 text-center text-xs text-slate-400">
          <div className="px-3 py-3 flex flex-col items-center gap-1">
            <Clock className="w-4 h-4 text-primary" />
            <span>Respuesta en 24h</span>
          </div>
          <div className="px-3 py-3 flex flex-col items-center gap-1">
            <Mail className="w-4 h-4 text-primary" />
            <span>Precio negociable</span>
          </div>
          <div className="px-3 py-3 flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Demo incluida</span>
          </div>
        </div>

        {/* Form */}
        <div
          className="overflow-y-auto max-h-[60vh] px-6 py-5"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#334155 transparent",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs text-slate-300">Nombre *</Label>
                <Input id="firstName" placeholder="Juan" required className="bg-slate-800 border-slate-700 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs text-slate-300">Apellido *</Label>
                <Input id="lastName" placeholder="Pérez" required className="bg-slate-800 border-slate-700 h-9 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-300">Email corporativo *</Label>
                <Input id="email" type="email" placeholder="juan@empresa.com" required className="bg-slate-800 border-slate-700 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs text-slate-300">Empresa *</Label>
                <Input id="company" placeholder="Nombre de la empresa" required className="bg-slate-800 border-slate-700 h-9 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="teamSize" className="text-xs text-slate-300">Tamaño del equipo *</Label>
                <Select required>
                  <SelectTrigger id="teamSize" className="bg-slate-800 border-slate-700 h-9 text-sm">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="1-10">1-10 personas</SelectItem>
                    <SelectItem value="11-50">11-50 personas</SelectItem>
                    <SelectItem value="51-200">51-200 personas</SelectItem>
                    <SelectItem value="200+">200+ personas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry" className="text-xs text-slate-300">Industria *</Label>
                <Select required>
                  <SelectTrigger id="industry" className="bg-slate-800 border-slate-700 h-9 text-sm">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
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

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs text-slate-300">¿Qué necesitas? *</Label>
              <Textarea
                id="message"
                placeholder="Describe tus necesidades, número de usuarios, integraciones requeridas..."
                required
                className="bg-slate-800 border-slate-700 text-sm min-h-[90px] resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 h-9"
              >
                Enviar solicitud
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
