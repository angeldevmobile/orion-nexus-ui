import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Zap, Code2, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const stats = [
    { label: "Active Projects", value: "12", icon: Code2, trend: "+3 this week" },
    { label: "AI Generations", value: "248", icon: Zap, trend: "+48 today" },
    { label: "Team Members", value: "8", icon: Users, trend: "2 invited" },
    { label: "Credits Used", value: "1,234", icon: TrendingUp, trend: "68% remaining" },
  ];

  const recentProjects = [
    { name: "E-commerce Dashboard", status: "Active", lastModified: "2 hours ago" },
    { name: "Landing Page", status: "Active", lastModified: "5 hours ago" },
    { name: "Mobile App UI", status: "Draft", lastModified: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-bold mb-2">Welcome back</h1>
                <p className="text-muted-foreground">Here's what's happening with your projects</p>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to="/ai-chat">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Link>
              </Button>
            </div>

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

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest work and drafts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div
                      key={project.name}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last modified: {project.lastModified}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === "Active" 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
