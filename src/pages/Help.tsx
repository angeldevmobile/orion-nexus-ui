import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Search, Book, MessageCircle, Mail, FileText, Zap, Loader2, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocArticle {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  tags: string[];
  order_index: number;
}

interface DocFaq {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface CategoryCount {
  category: string;
  count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  getting_started: { label: "Primeros Pasos", icon: Zap, color: "text-yellow-500" },
  tutorial: { label: "Tutoriales", icon: FileText, color: "text-blue-500" },
  documentation: { label: "Documentación", icon: Book, color: "text-primary" },
  faq: { label: "FAQs", icon: HelpCircle, color: "text-green-500" },
};

function categoryLabel(cat: string) {
  return CATEGORY_META[cat]?.label ?? cat;
}

// ─── API fetchers ─────────────────────────────────────────────────────────────

async function fetchCategoryCounts(): Promise<CategoryCount[]> {
  const res = await fetch(`${API_URL}/docs/articles/categories`);
  const json = await res.json();
  return json.data ?? [];
}

async function fetchArticles(search: string, category: string): Promise<DocArticle[]> {
  const params = new URLSearchParams({ limit: "20" });
  if (search) params.set("search", search);
  if (category && category !== "all") params.set("category", category);
  const res = await fetch(`${API_URL}/docs/articles?${params}`);
  const json = await res.json();
  return json.data ?? [];
}

async function fetchFaqs(): Promise<DocFaq[]> {
  const res = await fetch(`${API_URL}/docs/faqs`);
  const json = await res.json();
  return json.data ?? [];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Help() {
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Conteos por categoría para las tarjetas
  const {
    data: categoryCounts = [],
    isLoading: loadingCounts,
  } = useQuery<CategoryCount[]>({
    queryKey: ["docs-category-counts"],
    queryFn: fetchCategoryCounts,
  });

  // Artículos filtrados (se disparan cuando el usuario busca o filtra)
  const isFiltering = activeSearch !== "" || activeCategory !== "all";
  const {
    data: articles = [],
    isLoading: loadingArticles,
    isError: errorArticles,
  } = useQuery<DocArticle[]>({
    queryKey: ["docs-articles", activeSearch, activeCategory],
    queryFn: () => fetchArticles(activeSearch, activeCategory),
    enabled: isFiltering,
  });

  // FAQs
  const {
    data: faqs = [],
    isLoading: loadingFaqs,
    isError: errorFaqs,
  } = useQuery<DocFaq[]>({
    queryKey: ["docs-faqs"],
    queryFn: fetchFaqs,
  });

  const countFor = (cat: string) =>
    categoryCounts.find((c) => c.category === cat)?.count ?? 0;

  const categories = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    ...meta,
    count: countFor(key),
  }));

  const handleSearch = () => {
    setActiveSearch(search.trim());
    if (search.trim()) setActiveCategory("all");
  };

  const handleCategoryClick = (key: string) => {
    setActiveCategory(key === activeCategory ? "all" : key);
    setActiveSearch("");
    setSearch("");
  };

  const quickLinks = [
    { title: "Guía de inicio rápido", icon: Zap, color: "text-primary", category: "getting_started" },
    { title: "Documentación API", icon: FileText, color: "text-green-500", category: "documentation" },
    { title: "Tutoriales", icon: Book, color: "text-blue-500", category: "tutorial" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <IconSidebar />
        <main className="flex-1 ml-14 p-8">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-heading font-bold mb-4 flex items-center justify-center gap-2">
                <HelpCircle className="w-10 h-10 text-primary" />
                Centro de Ayuda
              </h1>
              <p className="text-xl text-muted-foreground">¿En qué podemos ayudarte hoy?</p>
            </div>

            {/* Search Bar */}
            <div className="mb-12">
              <div className="relative max-w-2xl mx-auto flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Busca artículos, documentación, preguntas..."
                    className="pl-12 h-14 text-lg bg-card border-border"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button className="h-14 px-6" onClick={handleSearch}>
                  Buscar
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {categories.map((cat) => (
                <Card
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`bg-card border-border hover:border-primary/50 transition-all cursor-pointer group ${
                    activeCategory === cat.key ? "border-primary ring-1 ring-primary" : ""
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <cat.icon className={`w-6 h-6 ${cat.color}`} />
                    </div>
                    <h3 className="font-medium mb-1">{cat.label}</h3>
                    {loadingCounts ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                    ) : (
                      <Badge variant="secondary">{cat.count} artículos</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Articles list (shown when filtering/searching) */}
            {isFiltering && (
              <Card className="bg-card border-border mb-12">
                <CardHeader>
                  <CardTitle>
                    {activeSearch
                      ? `Resultados para "${activeSearch}"`
                      : `Categoría: ${categoryLabel(activeCategory)}`}
                  </CardTitle>
                  <CardDescription>
                    {loadingArticles
                      ? "Buscando..."
                      : `${articles.length} artículo${articles.length !== 1 ? "s" : ""} encontrado${articles.length !== 1 ? "s" : ""}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingArticles && (
                    <div className="flex items-center gap-2 text-muted-foreground py-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> Cargando artículos...
                    </div>
                  )}
                  {errorArticles && (
                    <div className="flex items-center gap-2 text-destructive py-4">
                      <AlertCircle className="w-4 h-4" /> Error al cargar artículos.
                    </div>
                  )}
                  {!loadingArticles && !errorArticles && articles.length === 0 && (
                    <p className="text-muted-foreground py-4">No se encontraron artículos.</p>
                  )}
                  {!loadingArticles && articles.length > 0 && (
                    <ul className="divide-y divide-border">
                      {articles.map((article) => (
                        <li key={article.id} className="py-4">
                          <a
                            href={`/help/articles/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start justify-between gap-4 group hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium mb-1 group-hover:text-primary transition-colors">
                                {article.title}
                              </p>
                              {article.excerpt && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {article.excerpt}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {article.tags?.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {categoryLabel(article.category)}
                            </Badge>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <Card className="bg-card border-border mb-12">
              <CardHeader>
                <CardTitle>Accesos Rápidos</CardTitle>
                <CardDescription>Recursos más utilizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickLinks.map((link) => (
                    <Button
                      key={link.title}
                      variant="outline"
                      className="h-auto py-4 justify-start"
                      onClick={() => link.category && handleCategoryClick(link.category)}
                    >
                      <link.icon className={`w-5 h-5 mr-3 ${link.color}`} />
                      <span className="font-medium">{link.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card className="bg-card border-border mb-12">
              <CardHeader>
                <CardTitle>Preguntas Frecuentes</CardTitle>
                <CardDescription>Respuestas a las dudas más comunes</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingFaqs && (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> Cargando FAQs...
                  </div>
                )}
                {errorFaqs && (
                  <div className="flex items-center gap-2 text-destructive py-4">
                    <AlertCircle className="w-4 h-4" /> Error al cargar FAQs.
                  </div>
                )}
                {!loadingFaqs && !errorFaqs && faqs.length === 0 && (
                  <p className="text-muted-foreground py-4">No hay FAQs disponibles aún.</p>
                )}
                {!loadingFaqs && faqs.length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq) => (
                      <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2">¿No encuentras lo que buscas?</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Nuestro equipo de soporte está listo para ayudarte
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Mail className="w-4 h-4 mr-2" />
                    Contactar Soporte
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat en Vivo
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
