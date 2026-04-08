import { Link } from "react-router-dom";

type FooterLink = {
  label: string;
  to?: string;
  comingSoon?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: "Empresa",
    links: [
      { label: "Empleos", comingSoon: true },
      { label: "Prensa y Medios", comingSoon: true },
      { label: "Empresas", comingSoon: true },
      { label: "Seguridad", comingSoon: true },
      { label: "Centro de Confianza", comingSoon: true },
      { label: "Alianzas", comingSoon: true },
    ],
  },
  {
    title: "Producto",
    links: [
      { label: "Precios", to: "/pricing" },
      { label: "Descuento Estudiante", comingSoon: true },
      { label: "Conexiones", comingSoon: true },
      { label: "Importar desde Figma", comingSoon: true },
      { label: "Changelog", comingSoon: true },
      { label: "Estado", comingSoon: true },
    ],
  },
  {
    title: "Soluciones",
    links: [
      { label: "Desarrolladores", comingSoon: true },
      { label: "Diseñadores", comingSoon: true },
      { label: "Startups", comingSoon: true },
      { label: "Empresas", comingSoon: true },
      { label: "Agencias", comingSoon: true },
      { label: "Educación", comingSoon: true },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Aprender", to: "/help" },
      { label: "Guías", comingSoon: true },
      { label: "Blog", comingSoon: true },
      { label: "Soporte", to: "/help" },
      { label: "Documentación", comingSoon: true },
      { label: "Referencia API", comingSoon: true },
    ],
  },
  {
    title: "Comunidad",
    links: [
      { label: "Explorar Comunidad", to: "/community" },
      { label: "Ser Partner", comingSoon: true },
      { label: "Contratar Partner", comingSoon: true },
      { label: "Afiliados", comingSoon: true },
      { label: "Discord", comingSoon: true },
      { label: "Twitter", comingSoon: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de Privacidad", to: "/privacy" },
      { label: "Cookies", to: "/cookies" },
      { label: "Términos", to: "/terms" },
      { label: "Reglas de la Plataforma", comingSoon: true },
      { label: "Reportar Abuso", comingSoon: true },
      { label: "Seguridad", comingSoon: true },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-heading font-semibold text-sm mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.comingSoon ? (
                      <span className="group/link inline-flex items-center gap-1.5 cursor-default">
                        <span className="text-sm text-muted-foreground/40 group-hover/link:text-muted-foreground/60 transition-colors">
                          {link.label}
                        </span>
                        <span className="opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 text-[10px] font-medium text-primary/60 bg-primary/8 border border-primary/15 rounded px-1.5 py-0.5 leading-none whitespace-nowrap">
                          Próximamente
                        </span>
                      </span>
                    ) : (
                      <Link
                        to={link.to!}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Orion Cloud Platform — Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
