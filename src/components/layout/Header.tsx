import { Button } from "@/components/ui/button";
import { Rocket, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const appRoutes = [
  "/dashboard", "/ai-chat", "/editor", "/components",
  "/projects", "/settings", "/pricing", "/community",
  "/history", "/help", "/admin",
];

const landingNav = [
  { label: "Precios", to: "/pricing" },
  { label: "Comunidad", to: "/community" },
  { label: "Ayuda", to: "/help" },
];

const appNav = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "AI Chat", to: "/ai-chat" },
  { label: "Proyectos", to: "/projects" },
  { label: "Precios", to: "/pricing" },
];

export const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAppRoute = appRoutes.includes(location.pathname);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navLinks = isHome ? landingNav : appNav;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/95 backdrop-blur-xl shadow-sm shadow-black/20"
          : "border-b border-transparent bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-primary to-cyan-500 shadow-md shadow-primary/30">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            Orion Builder
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isAppRoute && (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:flex text-muted-foreground hover:text-foreground"
              >
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 px-5"
              >
                <Link to="/register">Comenzar</Link>
              </Button>
            </>
          )}

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
            >
              {link.label}
            </Link>
          ))}
          {!isAppRoute && (
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                <Link to="/register">Comenzar Gratis</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
