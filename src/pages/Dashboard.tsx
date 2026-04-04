import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Zap, Code2, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API = "http://localhost:5000";

const PLAN_DAILY: Record<string, number>   = { free: 5,  pro: 10, enterprise: 50 };
const PLAN_MONTHLY: Record<string, number> = { free: 0,  pro: 500, enterprise: 2000 };

interface Project {
  id: number;
  name: string;
  is_public: boolean;
  updated_at: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2)  return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { user, token } = useAuth();

  const [projects, setProjects]           = useState<Project[]>([]);
  const [projectTotal, setProjectTotal]   = useState(0);
  const [membersCount, setMembersCount]   = useState(0);
  const [pendingCount, setPendingCount]   = useState(0);
  const [loading, setLoading]             = useState(true);

  // ── Credit calculations from user preferences ──────────────────────────────
  const prefs       = user?.preferences as Record<string, unknown> | undefined;
  const plan        = (prefs?.subscription as string) ?? "free";
  const dailyLimit  = PLAN_DAILY[plan]   ?? 5;
  const monthlyLimit = PLAN_MONTHLY[plan] ?? 0;
  const dailyRemaining  = Number(prefs?.credits_daily_remaining  ?? dailyLimit);
  const monthlyRemaining = Number(prefs?.credits_monthly_remaining ?? monthlyLimit);
  const totalLimit      = dailyLimit + monthlyLimit;
  const totalRemaining  = dailyRemaining + monthlyRemaining;
  const creditsUsed     = Math.max(0, totalLimit - totalRemaining);
  const creditsPercent  = totalLimit > 0 ? Math.round((totalRemaining / totalLimit) * 100) : 0;
  const aiUsedToday     = Math.max(0, dailyLimit - dailyRemaining);

  useEffect(() => {
    if (!token) return;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/projects?limit=5&sort=updated_at&order=desc`, { headers }).then((r) => r.json()),
      fetch(`${API}/api/team/members`, { headers }).then((r) => r.json()),
    ])
      .then(([projRes, teamRes]) => {
        if (projRes.success) {
          setProjects(projRes.data ?? []);
          setProjectTotal(projRes.pagination?.total ?? 0);
        }
        if (teamRes.success) {
          setMembersCount(teamRes.data?.members?.length ?? 0);
          setPendingCount(teamRes.data?.pending?.length  ?? 0);
        }
      })
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
  }, [token]);

  const newThisWeek = projects.filter((p) => {
    const diff = Date.now() - new Date(p.created_at).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const stats = [
    {
      label: "Active Projects",
      value: loading ? "—" : String(projectTotal),
      icon: Code2,
      trend: loading ? "" : `+${newThisWeek} this week`,
    },
    {
      label: "AI Generations",
      value: loading ? "—" : String(aiUsedToday),
      icon: Zap,
      trend: `${dailyRemaining}/${dailyLimit} daily remaining`,
    },
    {
      label: "Team Members",
      value: loading ? "—" : String(membersCount),
      icon: Users,
      trend: pendingCount > 0 ? `${pendingCount} invited` : "No pending invites",
    },
    {
      label: "Credits Used",
      value: loading ? "—" : creditsUsed.toLocaleString(),
      icon: TrendingUp,
      trend: `${creditsPercent}% remaining`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <IconSidebar />
        <main className="flex-1 ml-14 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-bold mb-2">
                  Welcome back{user?.username ? `, ${user.username}` : ""}
                </h1>
                <p className="text-muted-foreground">Here's what's happening with your projects</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/ai-chat">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <Card key={stat.label} className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <stat.icon className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Projects */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your latest work and drafts</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/projects">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 rounded-xl bg-secondary/30 animate-pulse" />
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-3">No projects yet.</p>
                    <Button asChild size="sm">
                      <Link to="/ai-chat">
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first project
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        to="/editor"
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Last modified: {timeAgo(project.updated_at)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.is_public
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {project.is_public ? "Public" : "Private"}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
