import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Eye, Share2, Code2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ViewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    name: string;
    author?: string;
    description: string;
    url?: string;
    likes?: number;
    views?: number;
    framework?: string;
  };
}

export function ViewProjectModal({ open, onOpenChange, project }: ViewProjectModalProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(project.likes || 0);
  const { toast } = useToast();

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(project.url || window.location.href);
    toast({
      title: "¡Enlace copiado!",
      description: "El enlace del proyecto se ha copiado al portapapeles.",
    });
  };

  // Simulación de URL del proyecto
  const projectUrl = project.url || `https://lovable.app/preview/${project.name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[90vh] p-0 gap-0 animate-scale-in">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{project.name}</DialogTitle>
              <DialogDescription className="text-base">
                {project.author && `Por ${project.author} • `}
                {project.description}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {project.framework && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  {project.framework}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              className={`transition-all hover:scale-[1.05] ${liked ? 'bg-red-500/10 border-red-500/50 text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
              {likes}
            </Button>
            
            {project.views !== undefined && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                {project.views}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="transition-all hover:scale-[1.05]"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(projectUrl, '_blank')}
              className="bg-primary hover:bg-primary/90 transition-all hover:scale-[1.05]"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir en nueva pestaña
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-secondary/20 relative overflow-hidden">
          <iframe
            src={projectUrl}
            className="w-full h-full border-0"
            title={project.name}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
          
          {/* Loading overlay - se puede mejorar */}
          <div className="absolute inset-0 bg-background flex items-center justify-center pointer-events-none opacity-0 animate-fade-out">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Cargando proyecto...</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Vista previa del proyecto • Interactúa con la aplicación</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
