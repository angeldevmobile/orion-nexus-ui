import { NavLink } from "@/components/NavLink";
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
  HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/ai-chat", icon: MessageSquare, label: "AI Chat" },
  { to: "/editor", icon: Code2, label: "Editor" },
  { to: "/components", icon: Layers, label: "Components" },
  { to: "/projects", icon: FolderOpen, label: "Projects" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/pricing", icon: CreditCard, label: "Plans" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/history", icon: History, label: "History" },
  { to: "/help", icon: HelpCircle, label: "Help" },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-border bg-card p-4 overflow-y-auto">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:bg-secondary hover:text-foreground"
            activeClassName="bg-primary text-primary-foreground shadow-lg"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
