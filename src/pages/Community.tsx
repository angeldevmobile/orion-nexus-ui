import { IconSidebar } from "@/components/layout/IconSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, MessageSquare, Trophy, Star, Search, ThumbsUp, Eye, Plus, ExternalLink, Globe, Loader2, Send, ChevronRight, Medal } from "lucide-react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "@/service/ApiService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: { username: string; avatar?: string };
  likes_count: number;
  views_count: number;
  tags: string[];
  attachments?: string[];
  link?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: { username: string; avatar?: string };
}

interface ApiPostRaw {
  id: string;
  title: string;
  content: string;
  author: { username: string; avatar?: string };
  likes_count: number;
  views_count?: number;
  tags: string[];
  attachments?: string[];
  comments?: Comment[];
}

interface ApiResponse {
  data: ApiPostRaw[];
}

interface ApiPostDetailResponse {
  data: ApiPostRaw & { comments: Comment[] };
}

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar?: string;
  posts_count: number;
  total_likes: number;
  total_views: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: { username: string; avatar?: string };
  likes_count: number;
  comments_count: number;
  tags: string[];
  is_resolved: boolean;
  created_at: string;
}

interface DiscussionsResponse {
  data: Discussion[];
}

function mapPost(raw: ApiPostRaw): CommunityPost {
  return {
    ...raw,
    views_count: raw.views_count ?? 0,
    link: raw.attachments?.[0],
  };
}

/* �"?�"? Project View Modal �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"? */
function ProjectViewModal({
  project,
  onClose,
  onLikeChange,
}: {
  project: CommunityPost | null;
  onClose: () => void;
  onLikeChange?: (id: string, newCount: number, isLiked: boolean) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likingInProgress, setLikingInProgress] = useState(false);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!project) {
      viewTracked.current = false;
      setComments([]);
      setCommentText("");
      setLiked(false);
      return;
    }

    setLikesCount(project.likes_count);

    // Incrementar vistas (solo una vez por apertura)
    if (!viewTracked.current) {
      viewTracked.current = true;
      apiService.patch(`/community/posts/${project.id}/view`).catch(() => {/* silent */});
    }

    // Cargar comentarios y likes del post completo
    setLoadingComments(true);
    apiService.get<ApiPostDetailResponse>(`/community/posts/${project.id}`)
      .then((res) => {
        setComments(res.data.comments || []);
        setLikesCount(res.data.likes_count);
        if (user) {
          const likesList = (res.data as unknown as { likes?: { user_id: number }[] }).likes || [];
          setLiked(likesList.some((l) => String(l.user_id) === user.id));
        }
      })
      .catch(() => {/* silent */})
      .finally(() => setLoadingComments(false));
  }, [project, user]);

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Necesitas una cuenta para dar like.", variant: "destructive" });
      return;
    }
    if (likingInProgress || !project) return;
    setLikingInProgress(true);
    const newLiked = !liked;
    const newCount = newLiked ? likesCount + 1 : likesCount - 1;
    setLiked(newLiked);
    setLikesCount(newCount);
    try {
      await apiService.post(`/community/posts/${project.id}/like`);
      onLikeChange?.(project.id, newCount, newLiked);
    } catch {
      setLiked(!newLiked);
      setLikesCount(likesCount);
    } finally {
      setLikingInProgress(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Necesitas una cuenta para comentar.", variant: "destructive" });
      return;
    }
    if (!commentText.trim() || !project) return;
    setPostingComment(true);
    try {
      const res = await apiService.post<{ data: Comment }>(`/community/posts/${project.id}/comments`, {
        content: commentText.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "No se pudo publicar", variant: "destructive" });
    } finally {
      setPostingComment(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={!!project} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-xl leading-tight">{project.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">por {project.author.username}</p>
            </div>
            {project.link && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(project.link, "_blank")}
                className="gap-2 shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.content}</p>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleLike}
              disabled={likingInProgress}
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} />
              {likesCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              {project.views_count + 1}
            </span>
          </div>
        </DialogHeader>

        {/* Two-column: preview + comments */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview */}
          <div className="flex-1 overflow-hidden bg-secondary/20 border-r border-border">
            {project.link ? (
              <iframe
                src={project.link}
                title={project.title}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                <Globe className="w-16 h-16 opacity-30" />
                <p className="text-lg font-medium">Sin preview disponible</p>
                <p className="text-sm">Este proyecto no tiene un link de demo.</p>
              </div>
            )}
          </div>

          {/* Comments panel */}
          <div className="w-72 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-medium text-sm">Comentarios</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sin comentarios aún. ¡Sé el primero!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 shrink-0">
                        <AvatarFallback className="text-xs">{c.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{c.author.username}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(c.created_at).toLocaleDateString("es", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm pl-8 text-muted-foreground">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment input */}
            <div className="px-4 py-3 border-t border-border space-y-2">
              <Textarea
                placeholder={user ? "Escribe un comentario..." : "Inicia sesión para comentar"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!user}
                rows={2}
                className="text-sm resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleAddComment}
                disabled={!user || !commentText.trim() || postingComment}
              >
                {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1.5" />Comentar</>}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* �"?�"? Main Component �"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"?�"? */
export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProject, setViewingProject] = useState<CommunityPost | null>(null);
  const [search, setSearch] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const leaderboardFetched = useRef(false);

  // Discussions state
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const discussionsFetched = useRef(false);
  const [discSearch, setDiscSearch] = useState("");
  const discSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newDiscOpen, setNewDiscOpen] = useState(false);
  const [discTitle, setDiscTitle] = useState("");
  const [discContent, setDiscContent] = useState("");
  const [discTags, setDiscTags] = useState<string[]>([]);
  const [discTagInput, setDiscTagInput] = useState("");
  const [savingDisc, setSavingDisc] = useState(false);
  const [viewingDiscussion, setViewingDiscussion] = useState<Discussion | null>(null);

  const fetchProjects = useCallback((q?: string) => {
    setLoading(true);
    const endpoint = q ? `/community/posts?search=${encodeURIComponent(q)}` : '/community/posts';
    apiService.get<ApiResponse>(endpoint)
      .then((res) => {
        setProjects((res.data || []).map(mapPost));
      })
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const fetchLeaderboard = useCallback(() => {
    setLoadingLeaderboard(true);
    apiService.get<LeaderboardResponse>('/community/leaderboard')
      .then((res) => setLeaderboard(res.data || []))
      .catch(() => {/* silent */})
      .finally(() => setLoadingLeaderboard(false));
  }, []);

  const fetchDiscussions = useCallback((q?: string) => {
    setLoadingDiscussions(true);
    const endpoint = q
      ? `/community/posts?category=discussion&search=${encodeURIComponent(q)}`
      : '/community/posts?category=discussion';
    apiService.get<DiscussionsResponse>(endpoint)
      .then((res) => setDiscussions((res.data || []) as unknown as Discussion[]))
      .catch(() => {/* silent */})
      .finally(() => setLoadingDiscussions(false));
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'leaderboard' && !leaderboardFetched.current) {
      leaderboardFetched.current = true;
      fetchLeaderboard();
    }
    if (tab === 'discussions' && !discussionsFetched.current) {
      discussionsFetched.current = true;
      fetchDiscussions();
    }
  };

  const handleDiscSearchChange = (value: string) => {
    setDiscSearch(value);
    if (discSearchTimer.current) clearTimeout(discSearchTimer.current);
    discSearchTimer.current = setTimeout(() => {
      fetchDiscussions(value.trim() || undefined);
    }, 400);
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discTitle.trim() || !discContent.trim()) return;
    setSavingDisc(true);
    try {
      await apiService.post('/community/posts', {
        title: discTitle.trim(),
        content: discContent.trim(),
        category: 'discussion',
        tags: discTags,
        attachments: [],
      });
      toast({ title: "Discusi�n creada", description: "Tu pregunta ha sido publicada." });
      setNewDiscOpen(false);
      setDiscTitle(""); setDiscContent(""); setDiscTags([]); setDiscTagInput("");
      fetchDiscussions(discSearch.trim() || undefined);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "No se pudo publicar", variant: "destructive" });
    } finally {
      setSavingDisc(false);
    }
  };

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchProjects(value.trim() || undefined);
    }, 400);
  };

  const handleLikeFromCard = async (projectId: string) => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Necesitas una cuenta para dar like.", variant: "destructive" });
      return;
    }
    const isCurrentlyLiked = likedIds.has(projectId);
    const newLiked = !isCurrentlyLiked;
    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (newLiked) { next.add(projectId); } else { next.delete(projectId); }
      return next;
    });
    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, likes_count: p.likes_count + (newLiked ? 1 : -1) } : p)
    );
    try {
      await apiService.post(`/community/posts/${projectId}/like`);
    } catch {
      // Revert on error
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyLiked) { next.add(projectId); } else { next.delete(projectId); }
        return next;
      });
      setProjects((prev) =>
        prev.map((p) => p.id === projectId ? { ...p, likes_count: p.likes_count + (newLiked ? -1 : 1) } : p)
      );
    }
  };

  const handleLikeChangeFromModal = (id: string, newCount: number, isLiked: boolean) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, likes_count: newCount } : p));
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) { next.add(id); } else { next.delete(id); }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <IconSidebar />
        <main className="flex-1 ml-14 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2">
                  <Users className="w-8 h-8 text-primary" />
                  Comunidad
                </h1>
                <p className="text-muted-foreground">
                  Conecta con otros desarrolladores y comparte tus proyectos
                </p>
              </div>
              <Button
                onClick={() => setAddProjectModalOpen(true)}
                className="bg-primary hover:bg-primary/90 transition-all hover:scale-[1.05]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Subir mi proyecto
              </Button>
            </div>

            <Tabs defaultValue="projects" className="space-y-6" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="projects" className="gap-2">
                  <Star className="w-4 h-4" />
                  Proyectos Destacados
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Ranking
                </TabsTrigger>
                <TabsTrigger value="discussions" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discusiones
                </TabsTrigger>
              </TabsList>

              {/* Featured Projects */}
              <TabsContent value="projects" className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar proyectos..."
                      className="pl-10 bg-card border-border"
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cargando proyectos...
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium">{search ? `Sin resultados para "${search}"` : "No hay proyectos aún"}</p>
                    <p className="text-sm mt-1">{search ? "Intenta con otro término" : "¡Sé el primero en publicar!"}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Card key={project.id} className="bg-card border-border hover:border-primary/50 transition-all group overflow-hidden">
                        {/* Thumbnail */}
                        <div className="h-36 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-5xl">
                          �Ys?
                        </div>

                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {project.author.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <CardTitle className="text-base mt-2">{project.title}</CardTitle>
                          <CardDescription>por {project.author.username}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{project.content}</p>

                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {project.views_count}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleLikeFromCard(project.id); }}
                                className={`flex items-center gap-1 transition-colors hover:text-primary ${likedIds.has(project.id) ? "text-primary" : ""}`}
                              >
                                <ThumbsUp className={`w-4 h-4 ${likedIds.has(project.id) ? "fill-primary" : ""}`} />
                                {project.likes_count}
                              </button>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingProject(project)}
                              className="transition-all hover:scale-[1.05]"
                            >
                              Ver proyecto
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Leaderboard */}
              <TabsContent value="leaderboard" className="space-y-4">
                {loadingLeaderboard ? (
                  <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cargando ranking...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Trophy className="w-14 h-14 opacity-20 mx-auto mb-3" />
                    <p className="text-lg font-medium">Sin datos a�n</p>
                    <p className="text-sm mt-1">�Publica proyectos para aparecer aqu�!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => {
                      const medal = index === 0 ? "??" : index === 1 ? "??" : index === 2 ? "??" : null;
                      return (
                        <Card key={entry.id} className={`bg-card border-border transition-all ${index < 3 ? "border-primary/30" : ""}`}>
                          <CardContent className="flex items-center gap-4 py-4">
                            <span className="text-2xl w-8 text-center shrink-0">
                              {medal ?? <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>}
                            </span>
                            <Avatar className="w-10 h-10 shrink-0">
                              <AvatarFallback className={`text-sm font-bold ${index < 3 ? "bg-primary/20 text-primary" : ""}`}>
                                {entry.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{entry.username}</p>
                              <p className="text-xs text-muted-foreground">{entry.posts_count} proyecto{entry.posts_count !== 1 ? "s" : ""} publicado{entry.posts_count !== 1 ? "s" : ""}</p>
                            </div>
                            <div className="flex items-center gap-5 shrink-0 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <ThumbsUp className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-foreground">{entry.total_likes}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4" />
                                {entry.total_views}
                              </span>
                              {index === 0 && (
                                <Medal className="w-5 h-5 text-yellow-400" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Discussions */}
              <TabsContent value="discussions" className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar discusiones..."
                      className="pl-9 bg-card border-border"
                      value={discSearch}
                      onChange={(e) => handleDiscSearchChange(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setNewDiscOpen(true)} className="bg-primary hover:bg-primary/90 shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva discusi�n
                  </Button>
                </div>

                {loadingDiscussions ? (
                  <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cargando discusiones...
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <MessageSquare className="w-14 h-14 opacity-20 mx-auto mb-3" />
                    <p className="text-lg font-medium">{discSearch ? `Sin resultados para "${discSearch}"` : "Sin discusiones a�n"}</p>
                    <p className="text-sm mt-1">{discSearch ? "Intenta con otro t�rmino" : "�S� el primero en iniciar una conversaci�n!"}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {discussions.map((disc) => (
                      <Card
                        key={disc.id}
                        className="bg-card border-border hover:border-primary/40 transition-all cursor-pointer group"
                        onClick={() => setViewingDiscussion(disc)}
                      >
                        <CardContent className="flex items-start gap-4 py-4">
                          <Avatar className="w-9 h-9 shrink-0 mt-0.5">
                            <AvatarFallback className="text-xs">{disc.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold leading-tight truncate group-hover:text-primary transition-colors">{disc.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  por {disc.author.username} � {new Date(disc.created_at).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              {disc.is_resolved && (
                                <Badge variant="secondary" className="shrink-0 text-green-400 border-green-400/30 bg-green-400/10">Resuelto</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{disc.content}</p>
                            {disc.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {disc.tags.slice(0, 4).map(t => (
                                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" />{disc.likes_count}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{disc.comments_count} respuesta{disc.comments_count !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <AddProjectModal
        open={addProjectModalOpen}
        onOpenChange={setAddProjectModalOpen}
        onProjectAdded={() => fetchProjects(search.trim() || undefined)}
      />

      <ProjectViewModal
        project={viewingProject}
        onClose={() => setViewingProject(null)}
        onLikeChange={handleLikeChangeFromModal}
      />

      {/* New Discussion Modal */}
      <Dialog open={newDiscOpen} onOpenChange={(v) => { if (!v) { setNewDiscOpen(false); setDiscTitle(""); setDiscContent(""); setDiscTags([]); setDiscTagInput(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Nueva discusi�n
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDiscussion} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">T�tulo *</label>
              <Input
                value={discTitle}
                onChange={(e) => setDiscTitle(e.target.value)}
                placeholder="�Cu�l es tu pregunta o tema?"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descripci�n *</label>
              <Textarea
                value={discContent}
                onChange={(e) => setDiscContent(e.target.value)}
                placeholder="Explica con detalle tu pregunta o propuesta..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tags <span className="text-muted-foreground text-xs">(Enter para agregar)</span></label>
              <Input
                value={discTagInput}
                onChange={(e) => setDiscTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = discTagInput.trim();
                    if (v && !discTags.includes(v)) setDiscTags((p) => [...p, v]);
                    setDiscTagInput("");
                  }
                }}
                placeholder="React, TypeScript..."
              />
              {discTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {discTags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20" onClick={() => setDiscTags((p) => p.filter((x) => x !== t))}>
                      {t} �
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setNewDiscOpen(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={savingDisc}>
                {savingDisc ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Publicar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Discussion Modal */}
      {viewingDiscussion && (
        <DiscussionModal
          discussion={viewingDiscussion}
          onClose={() => setViewingDiscussion(null)}
        />
      )}
    </div>
  );
}

/* ?? Discussion View Modal ???????????????????????????????????????? */
function DiscussionModal({ discussion, onClose }: { discussion: Discussion; onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(discussion.likes_count);
  const [likingInProgress, setLikingInProgress] = useState(false);

  useEffect(() => {
    apiService.get<ApiPostDetailResponse>(`/community/posts/${discussion.id}`)
      .then((res) => {
        setComments(res.data.comments || []);
        setLikesCount(res.data.likes_count);
        if (user) {
          const likesList = (res.data as unknown as { likes?: { user_id: number }[] }).likes || [];
          setLiked(likesList.some((l) => String(l.user_id) === user.id));
        }
      })
      .catch(() => {/* silent */})
      .finally(() => setLoadingComments(false));
  }, [discussion.id, user]);

  const handleLike = async () => {
    if (!user) { toast({ title: "Inicia sesi�n", description: "Necesitas una cuenta para dar like.", variant: "destructive" }); return; }
    if (likingInProgress) return;
    setLikingInProgress(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((c) => c + (newLiked ? 1 : -1));
    try { await apiService.post(`/community/posts/${discussion.id}/like`); }
    catch { setLiked(!newLiked); setLikesCount((c) => c + (newLiked ? -1 : 1)); }
    finally { setLikingInProgress(false); }
  };

  const handleComment = async () => {
    if (!user) { toast({ title: "Inicia sesi�n", description: "Necesitas una cuenta para responder.", variant: "destructive" }); return; }
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const res = await apiService.post<{ data: Comment }>(`/community/posts/${discussion.id}/comments`, { content: commentText.trim() });
      setComments((p) => [...p, res.data]);
      setCommentText("");
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "No se pudo publicar", variant: "destructive" });
    } finally { setPosting(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-lg leading-snug">{discussion.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                por {discussion.author.username} � {new Date(discussion.created_at).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            {discussion.is_resolved && (
              <Badge variant="secondary" className="shrink-0 text-green-400 border-green-400/30 bg-green-400/10">Resuelto</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{discussion.content}</p>
          {discussion.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {discussion.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
            </div>
          )}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleLike}
              disabled={likingInProgress}
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} />
              {likesCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />{comments.length} respuesta{comments.length !== 1 ? "s" : ""}
            </span>
          </div>
        </DialogHeader>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loadingComments ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">Sin respuestas a�n. �S� el primero en responder!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="text-xs">{c.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-lg bg-secondary/30 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{c.author.username}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("es", { day: "numeric", month: "short" })}</span>
                  </div>
                  <p className="text-sm">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply input */}
        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <Textarea
            placeholder={user ? "Escribe tu respuesta..." : "Inicia sesi�n para responder"}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!user}
            rows={2}
            className="text-sm resize-none flex-1"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
          />
          <Button
            className="bg-primary hover:bg-primary/90 self-end"
            onClick={handleComment}
            disabled={!user || !commentText.trim() || posting}
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
