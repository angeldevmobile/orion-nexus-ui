import { Link } from "react-router-dom";

const footerSections = [
  {
    title: "Company",
    links: ["Careers", "Press & Media", "Enterprise", "Security", "Trust Center", "Partnerships"],
  },
  {
    title: "Product",
    links: ["Pricing", "Student Discount", "Connections", "Import from Figma", "Changelog", "Status"],
  },
  {
    title: "Solutions",
    links: ["Developers", "Designers", "Startups", "Enterprise", "Agencies", "Education"],
  },
  {
    title: "Resources",
    links: ["Learn", "Guides", "Videos", "Blog", "Support", "Documentation"],
  },
  {
    title: "Community",
    links: ["Become a Partner", "Hire a Partner", "Affiliates", "Discord", "Reddit", "Twitter"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Cookies", "Terms", "Platform Rules", "Report Abuse", "Security Concerns"],
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
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link 
                      to="#" 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Orion Cloud Platform — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
