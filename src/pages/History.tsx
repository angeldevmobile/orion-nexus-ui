import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History as HistoryIcon,
  Trash2,
  MessageSquare,
  FolderOpen,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { apiService } from "@/service/ApiService";

// Types

interface ChatSession {
  id: number;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface RecentProject {
  id: number;
  name: string;
  description: string;
  updated_at: string;
}

interface HistoryStats {
  totalSessions: number;
  totalMessages: number;
}

interface HistoryData {
  sessions: ChatSession[];
  recentProjects: RecentProject[];
  stats: HistoryStats;
}

interface HistoryResponse {
  success: boolean;
  data: HistoryData;
}

// Helpers

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `Hace ${days} dia${days > 1 ? "s" : ""}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `Hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
  return new Date(dateStr).toLocaleDateString("es-ES");
}

// Component

export default function History() {
  const navigate = useNavigate();
  const [data, setData]       = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get<HistoryResponse>("/ai/history");
      if (res.success) setData(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  async function deleteSession(id: number) {
    setDeleting(id);
    try {
      await apiService.delete(`/ai/chat-session/${id}`);
      setData(prev => prev ? { ...prev, sessions: prev.sessions.filter(s => s.id !== id) } : prev);
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <IconSidebar />
        <main className="flex-1 ml-14 p-8">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2">
                  <HistoryIcon className="w-8 h-8 text-primary" />
                  Historial y Actividad
                </h1>
                <p className="text-muted-foreground">Tus conversaciones y proyectos recientes</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-destructive mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Sessions */}
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Conversaciones con IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="animate-pulse flex gap-4 p-4 rounded-lg bg-secondary/20">
                            <div className="w-10 h-10 rounded-full bg-secondary" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-secondary rounded w-3/4" />
                              <div className="h-3 bg-secondary rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : !data?.sessions.length ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <MessageSquare className="w-12 h-12 text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground font-medium">Sin conversaciones todavia</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Ve al <button onClick={() => navigate("/ai-chat")} className="text-primary underline underline-offset-2">AI Chat</button> para crear tu primera sesion.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.sessions.map(session => (
                          <div key={session.id} className="relative pl-8 pb-5 border-l-2 border-border last:border-l-0 last:pb-0">
                            <div className="absolute left-0 top-1 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{session.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {session.message_count} mensaje{session.message_count !== 1 ? "s" : ""}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{timeAgo(session.updated_at ?? session.created_at)}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate("/ai-chat")}>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => deleteSession(session.id)}
                                  disabled={deleting === session.id}
                                >
                                  {deleting === session.id
                                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    : <Trash2 className="w-3.5 h-3.5" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">

                {/* Stats */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Estadisticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse flex justify-between">
                            <div className="h-4 bg-secondary rounded w-1/2" />
                            <div className="h-4 bg-secondary rounded w-8" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <StatRow label="Conversaciones" value={String(data?.stats.totalSessions ?? 0)} />
                        <StatRow label="Mensajes totales" value={String(data?.stats.totalMessages ?? 0)} />
                        <StatRow label="Proyectos recientes" value={String(data?.recentProjects.length ?? 0)} />
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Projects */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-primary" />
                      Proyectos recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse h-12 rounded bg-secondary/20" />
                        ))}
                      </div>
                    ) : !data?.recentProjects.length ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin proyectos todavia</p>
                    ) : (
                      <div className="space-y-2">
                        {data.recentProjects.map(p => (
                          <button
                            key={p.id}
                            onClick={() => navigate("/projects")}
                            className="w-full text-left p-2 rounded-lg hover:bg-secondary/40 transition-colors"
                          >
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{timeAgo(p.updated_at)}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-bold font-mono">{value}</span>
    </div>
  );
}