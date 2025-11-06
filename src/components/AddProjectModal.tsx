import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAdded?: (project: { name: string; link: string }) => void;
}

export function AddProjectModal({ open, onOpenChange, onProjectAdded }: AddProjectModalProps) {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [projectLink, setProjectLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject = {
      name: projectName,
      link: projectLink,
    };

    if (onProjectAdded) {
      onProjectAdded(newProject);
    }

    toast({
      title: "¡Proyecto agregado!",
      description: "Tu proyecto ha sido compartido con la comunidad exitosamente.",
    });

    // Reset form
    setProjectName("");
    setProjectLink("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Plus className="w-6 h-6 text-primary" />
            Agregar Proyecto
          </DialogTitle>
          <DialogDescription>
            Comparte tu proyecto con la comunidad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nombre del Proyecto *</Label>
            <Input
              id="project-name"
              placeholder="Mi Proyecto Increíble"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="transition-all focus:scale-[1.01]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-link">Link del Proyecto *</Label>
            <Input
              id="project-link"
              type="url"
              placeholder="https://mi-proyecto.com"
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
              required
              className="transition-all focus:scale-[1.01]"
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
