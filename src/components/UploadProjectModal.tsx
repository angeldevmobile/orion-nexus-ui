import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Link2, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface UploadProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadProjectModal({ open, onOpenChange }: UploadProjectModalProps) {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "¡Proyecto publicado!",
      description: "Tu proyecto ha sido compartido con la comunidad exitosamente.",
    });
    onOpenChange(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Upload className="w-7 h-7 text-primary" />
            Publicar Proyecto
          </DialogTitle>
          <DialogDescription>
            Comparte tu proyecto con la comunidad de Orion Builder
          </DialogDescription>
        </DialogHeader>

        <Card className="border-border">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-name">Nombre del Proyecto *</Label>
                <Input
                  id="project-name"
                  placeholder="Mi Proyecto Increíble"
                  required
                  className="transition-all focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Descripción *</Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe tu proyecto, tecnologías utilizadas y características principales..."
                  required
                  className="min-h-[100px] transition-all focus:scale-[1.01]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-url">URL del Proyecto *</Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="project-url"
                      type="url"
                      placeholder="https://mi-proyecto.com"
                      required
                      className="pl-10 transition-all focus:scale-[1.01]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select required>
                    <SelectTrigger id="category" className="transition-all focus:scale-[1.01]">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="landing">Landing Page</SelectItem>
                      <SelectItem value="portfolio">Portfolio</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="social">Red Social</SelectItem>
                      <SelectItem value="app">Aplicación Web</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas</Label>
                <Input
                  id="tags"
                  placeholder="React, TypeScript, Tailwind (separadas por comas)"
                  className="transition-all focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-image">Imagen de Portada *</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      id="project-image"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleImageChange}
                      className="transition-all focus:scale-[1.01]"
                    />
                  </div>
                  {previewImage && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tamaño recomendado: 1200x630px (ratio 16:9)
                </p>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <Image className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Consejos para una buena publicación:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Usa una imagen atractiva que muestre tu proyecto</li>
                      <li>• Describe claramente las características principales</li>
                      <li>• Incluye tecnologías y herramientas utilizadas</li>
                      <li>• Asegúrate de que la URL esté accesible públicamente</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
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
                  <Upload className="w-4 h-4 mr-2" />
                  Publicar Proyecto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
