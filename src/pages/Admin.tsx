import { useEffect, useState } from "react";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiService } from "@/service/ApiService";
import {
  Users,
  TrendingUp,
  DollarSign,
  Zap,
  Crown,
  Building2,
  Briefcase,
  RefreshCw,
  AlertTriangle,
  Activity,
  Database,
  Bookmark,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PlanRow   { plan: string; count: number }
interface SignupRow { id: string; username: string; email: string; plan: string; joined: string }
interface ConsumerRow {
  id: string; username: string; email: string;
  plan: string; daily_remaining: number; daily_limit: number; consumed: number;
}

interface AiSystemStats {
  queue: { active: number; queued: number };
  cache: { size: number; hits: number; misses: number };
}

interface AdminStats {
  users: { total: number; newWeek: number; newMonth: number };
  plans: PlanRow[];
  mrr: number;
  totalCreditsConsumedToday: number;
  recentSignups: SignupRow[];
  topConsumers: ConsumerRow[];
  aiSystem?: AiSystemStats;
}

interface AdminResponse { success: boolean; data: AdminStats }

interface AdminTemplate {
  id: string;
  name: string;
  description?: string;
  owner_username: string;
  likes_count: number;
  created_at: string;
}

const PLAN_COLORS: Record<string, string> = {
  free:       "bg-zinc-700 text-zinc-200",
  pro:        "bg-violet-700 text-violet-100",
  business:   "bg-blue-700 text-blue-100",
  enterprise: "bg-amber-700 text-amber-100",
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free:       <Zap className="w-3 h-3 inline mr-1" />,
  pro:        <Crown className="w-3 h-3 inline mr-1" />,
  business:   <Briefcase className="w-3 h-3 inline mr-1" />,
  enterprise: <Building2 className="w-3 h-3 inline mr-1" />,
};

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PLAN_COLORS[plan] ?? "bg-zinc-700 text-zinc-200"}`}>
      {PLAN_ICONS[plan]}
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await apiService.get<{ success: boolean; data: AdminTemplate[] }>("/admin/templates");
      if (res.success) setTemplates(res.data);
    } catch {
      // silent
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      await apiService.delete(`/admin/templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Plantilla eliminada", description: `"${name}" fue eliminada correctamente.` });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "No se pudo eliminar.", variant: "destructive" });
    } finally {
      setDeletingId(null);
      setConfirmTarget(null);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get<AdminResponse>("/admin/stats");
      if (res.success) {
        setStats(res.data);
        setLastRefresh(new Date());
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); fetchTemplates(); }, []);

  const planMap: Record<string, number> = {};
  stats?.plans.forEach((p) => { planMap[p.plan] = p.count; });
  const totalUsers = stats?.users.total ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <IconSidebar />
        <main className="flex-1 ml-14 p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold">Panel de Control</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Última actualización: {lastRefresh.toLocaleTimeString("es-ES")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                icon={<Users className="w-5 h-5 text-blue-400" />}
                label="Total usuarios"
                value={loading ? "…" : String(stats?.users.total ?? 0)}
                sub={loading ? "" : `+${stats?.users.newWeek ?? 0} esta semana`}
              />
              <KpiCard
                icon={<TrendingUp className="w-5 h-5 text-green-400" />}
                label="Nuevos este mes"
                value={loading ? "…" : String(stats?.users.newMonth ?? 0)}
                sub={loading ? "" : `+${stats?.users.newWeek ?? 0} últimos 7 días`}
              />
              <KpiCard
                icon={<DollarSign className="w-5 h-5 text-amber-400" />}
                label="MRR estimado"
                value={loading ? "…" : `$${stats?.mrr ?? 0}`}
                sub="Pro $20 · Biz $45 · Ent $99"
              />
              <KpiCard
                icon={<Zap className="w-5 h-5 text-violet-400" />}
                label="Créditos usados hoy"
                value={loading ? "…" : String(stats?.totalCreditsConsumedToday ?? 0)}
                sub="Total en toda la plataforma"
              />
            </div>

            {/* Plan breakdown */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Distribución por plan</CardTitle>
                <CardDescription>{totalUsers} usuarios en total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {(["free", "pro", "business", "enterprise"] as const).map((plan) => {
                    const count = planMap[plan] ?? 0;
                    const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                    return (
                      <div key={plan} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <PlanBadge plan={plan} />
                          <span className="text-lg font-bold">{loading ? "…" : count}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: pct > 0 ? `${pct}%` : "2%" }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{pct}% del total</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top consumidores */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Top consumidores de créditos hoy</CardTitle>
                  <CardDescription>Ordenados por créditos diarios consumidos</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton rows={5} />
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="pb-2 pr-3 font-medium">Usuario</th>
                          <th className="pb-2 pr-3 font-medium">Plan</th>
                          <th className="pb-2 text-right font-medium">Consumido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.topConsumers.map((u) => (
                          <tr key={u.id} className="border-b border-border/50 last:border-0">
                            <td className="py-2 pr-3">
                              <p className="font-medium truncate max-w-[120px]">{u.username}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">{u.email}</p>
                            </td>
                            <td className="py-2 pr-3"><PlanBadge plan={u.plan} /></td>
                            <td className="py-2 text-right">
                              <span className="font-mono font-semibold text-primary">
                                {u.consumed}
                              </span>
                              <span className="text-muted-foreground text-xs"> / {u.daily_limit}</span>
                            </td>
                          </tr>
                        ))}
                        {(stats?.topConsumers.length ?? 0) === 0 && (
                          <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">Sin datos</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Últimos registros */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Últimos registros</CardTitle>
                  <CardDescription>Los 10 usuarios más recientes</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton rows={5} />
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="pb-2 pr-3 font-medium">Usuario</th>
                          <th className="pb-2 pr-3 font-medium">Plan</th>
                          <th className="pb-2 text-right font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentSignups.map((u) => (
                          <tr key={u.id} className="border-b border-border/50 last:border-0">
                            <td className="py-2 pr-3">
                              <p className="font-medium truncate max-w-[120px]">{u.username}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">{u.email}</p>
                            </td>
                            <td className="py-2 pr-3"><PlanBadge plan={u.plan} /></td>
                            <td className="py-2 text-right text-xs text-muted-foreground whitespace-nowrap">{u.joined}</td>
                          </tr>
                        ))}
                        {(stats?.recentSignups.length ?? 0) === 0 && (
                          <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">Sin datos</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Plantillas */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-violet-400" />
                  Plantillas públicas
                </CardTitle>
                <CardDescription>
                  {templates.length} plantilla{templates.length !== 1 ? "s" : ""} publicada{templates.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTemplates ? (
                  <Skeleton rows={4} />
                ) : templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No hay plantillas publicadas.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="pb-2 pr-3 font-medium">Nombre</th>
                        <th className="pb-2 pr-3 font-medium">Autor</th>
                        <th className="pb-2 pr-3 font-medium text-center">Likes</th>
                        <th className="pb-2 pr-3 font-medium">Fecha</th>
                        <th className="pb-2 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {templates.map((t) => (
                        <tr key={t.id} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-3">
                            <p className="font-medium truncate max-w-[180px]">{t.name}</p>
                            {t.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{t.description}</p>
                            )}
                          </td>
                          <td className="py-2 pr-3 text-muted-foreground">{t.owner_username}</td>
                          <td className="py-2 pr-3 text-center font-mono">{t.likes_count}</td>
                          <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">{t.created_at}</td>
                          <td className="py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
                              disabled={deletingId === t.id}
                              onClick={() => setConfirmTarget({ id: t.id, name: t.name })}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* AI System */}
            {stats?.aiSystem && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="w-4 h-4 text-violet-400" />
                      Cola de IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-6">
                    <div>
                      <p className="text-2xl font-bold font-mono text-primary">{stats.aiSystem.queue.active}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Activas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono">{stats.aiSystem.queue.queued}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">En cola</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Database className="w-4 h-4 text-green-400" />
                      Caché de prompts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-6">
                    <div>
                      <p className="text-2xl font-bold font-mono">{stats.aiSystem.cache.size}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Entradas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-green-400">{stats.aiSystem.cache.hits}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Hits</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono text-red-400">{stats.aiSystem.cache.misses}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Misses</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </main>
      </div>

      <Dialog open={!!confirmTarget} onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}>
        <DialogContent className="max-w-sm bg-[#1a1a1f] border border-white/10 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <DialogTitle className="text-white text-base">Eliminar plantilla</DialogTitle>
            </div>
            <DialogDescription className="text-white/50 text-sm leading-relaxed">
              ¿Estás seguro de que quieres eliminar{" "}
              <span className="text-white/80 font-medium">"{confirmTarget?.name}"</span>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/5"
              onClick={() => setConfirmTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!!deletingId}
              onClick={() => confirmTarget && handleDeleteTemplate(confirmTarget.id, confirmTarget.name)}
            >
              {deletingId ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold font-mono">{value}</p>
        <p className="text-sm font-medium mt-0.5">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-8 bg-secondary rounded animate-pulse" />
      ))}
    </div>
  );
}
