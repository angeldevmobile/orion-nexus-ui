import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Code2,
  Layers,
  FolderOpen,
  Settings,
  CreditCard,
  Users,
  History,
  HelpCircle,
  Rocket,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard",  icon: Home,          label: "Dashboard" },
  { to: "/ai-chat",    icon: MessageSquare, label: "AI Chat" },
  { to: "/editor",     icon: Code2,         label: "Editor" },
  { to: "/components", icon: Layers,        label: "Components" },
  { to: "/projects",   icon: FolderOpen,    label: "Projects" },
  { to: "/settings",   icon: Settings,      label: "Settings" },
  { to: "/pricing",    icon: CreditCard,    label: "Plans" },
  { to: "/community",  icon: Users,         label: "Community" },
  { to: "/history",    icon: History,       label: "History" },
  { to: "/help",       icon: HelpCircle,    label: "Help" },
];

export const IconSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = (user?.username ?? user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <aside className="w-14 flex-shrink-0 flex flex-col items-center py-3 border-r border-border bg-card">
      <Link
        to="/"
        className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-5 hover:bg-primary/20 transition-colors"
        title="Inicio"
      >
        <Rocket className="w-4 h-4 text-primary" />
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            title={label}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              location.pathname === to
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
          </Link>
        ))}
      </nav>

      <div
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/40 to-violet-500/40 border border-primary/30 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity mb-1"
        title={user?.username ?? user?.email ?? "Usuario"}
        onClick={() => navigate("/settings")}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={initials} className="w-full h-full rounded-xl object-cover" />
        ) : (
          initials
        )}
      </div>

      <Button
        size="sm"
        onClick={() => navigate("/projects")}
        className="w-9 h-9 p-0 bg-primary hover:bg-primary/90"
        title="Publicar"
      >
        <Upload className="w-4 h-4" />
      </Button>
    </aside>
  );
};
