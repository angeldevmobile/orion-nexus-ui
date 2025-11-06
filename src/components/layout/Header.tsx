import { Button } from "@/components/ui/button";
import { Rocket, Menu, Home, Upload } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/60 animate-glow">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Orion Builder
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {!isHome && (
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Inicio
              </Link>
            </Button>
          )}
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link to="/ai-chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            AI Chat
          </Link>
          <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Proyectos
          </Link>
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Precios
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="hidden md:flex gap-2">
            <Link to="/projects">
              <Upload className="w-4 h-4" />
              Publicar
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link to="/auth">Iniciar Sesión</Link>
          </Button>
          <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
            <Link to="/auth">Comenzar</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
