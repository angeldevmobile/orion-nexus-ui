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
  ShieldCheck,
  LogOut,
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
  const { user, logout } = useAuth();

  const initials = (user?.username ?? user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <aside className="w-14 flex-shrink-0 flex flex-col items-center py-3 border-r border-border bg-card">
      <div className="relative group mb-5">
        <Link
          to="/"
          className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <Rocket className="w-4 h-4 text-primary" />
        </Link>
        <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 z-50
          opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap
          bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl
          border border-white/10">
          Inicio
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <div key={to} className="relative group">
            <Link
              to={to}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                location.pathname === to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
            </Link>
            <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 z-50
              opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap
              bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl
              border border-white/10">
              {label}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
            </div>
          </div>
        ))}

        {/* Icono de admin — solo visible para role=admin */}
        {user?.role === "admin" && (
          <div className="relative group">
            <Link
              to="/admin"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                location.pathname === "/admin"
                  ? "bg-amber-500 text-white"
                  : "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
            <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 z-50
              opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap
              bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl
              border border-white/10">
              Panel Admin
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
            </div>
          </div>
        )}
      </nav>

      {/* Avatar → Settings */}
      <div className="relative group mb-1">
        <div
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/40 to-violet-500/40 border border-primary/30 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/settings")}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={initials} className="w-full h-full rounded-xl object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 z-50
          opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap
          bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl
          border border-white/10">
          {user?.username ?? user?.email ?? "Usuario"}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
        </div>
      </div>

      {/* Publicar */}
      <div className="relative group mb-1">
        <Button
          size="sm"
          onClick={() => navigate("/projects")}
          className="w-9 h-9 p-0 bg-primary hover:bg-primary/90"
        >
          <Upload className="w-4 h-4" />
        </Button>
        <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 z-50
          opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap
          bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl
          border border-white/10">
          Publicar
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
        </div>
      </div>

      {/* Cerrar sesión */}
      <div className="relative group">
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
        <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 z-50
          opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap
          bg-zinc-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl
          border border-white/10">
          Cerrar sesión
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
        </div>
      </div>
    </aside>
  );
};
