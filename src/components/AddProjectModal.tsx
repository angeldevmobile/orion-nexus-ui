import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Eye, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiService } from "@/service/ApiService";

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAdded?: () => void;
}

export function AddProjectModal({ open, onOpenChange, onProjectAdded }: AddProjectModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleClose = () => {
    setTitle(""); setContent(""); setLink(""); setTags([]); setTagInput("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.post('/community/posts', {
        title,
        content,
        category: 'project',
        tags,
        attachments: link ? [link] : [],
      });
      toast({ title: "¡Proyecto publicado!", description: "Tu proyecto ha sido compartido con la comunidad." });
      handleClose();
      onProjectAdded?.();
    } catch (error) {
      toast({ title: "Error al publicar", description: String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const userStr = localStorage.getItem('user');
  const username = userStr ? JSON.parse(userStr)?.username ?? "Tú" : "Tú";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Upload className="w-6 h-6 text-primary" />
            Publicar Proyecto
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8 pt-2">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="proj-title">Nombre del Proyecto *</Label>
              <Input
                id="proj-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Mi Proyecto Increíble"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="proj-content">Descripción *</Label>
              <Textarea
                id="proj-content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Describe brevemente tu proyecto..."
                required
                rows={3}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="proj-link">Link del Proyecto</Label>
              <Input
                id="proj-link"
                value={link}
                onChange={e => setLink(e.target.value)}
                type="url"
                placeholder="https://mi-proyecto.com"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="proj-tags">Tags <span className="text-muted-foreground text-xs">(Enter para agregar)</span></Label>
              <Input
                id="proj-tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="React, TypeScript, Tailwind..."
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map(t => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive/20"
                      onClick={() => removeTag(t)}
                    >
                      {t} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                <Upload className="w-4 h-4 mr-2" />
                {loading ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </form>

          {/* Live Preview */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Eye className="w-4 h-4" /> Vista previa
            </p>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Thumbnail area */}
              <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-5xl">
                🚀
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-base leading-tight truncate">
                  {title || "Nombre del Proyecto"}
                </h3>
                <p className="text-xs text-muted-foreground">por {username}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {content || "Descripción del proyecto..."}
                </p>
                {(tags.length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map(t => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> 0 likes
                  </span>
                  <Button size="sm" variant="outline" disabled className="h-7 text-xs">
                    Ver proyecto
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
