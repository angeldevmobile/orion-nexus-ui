import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft, Book, Clock, Tag } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface DocArticle {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  slug: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  getting_started: "Primeros Pasos",
  tutorial: "Tutoriales",
  documentation: "Documentación",
  faq: "FAQs",
};

async function fetchArticle(slug: string): Promise<DocArticle> {
  const res = await fetch(`${API_URL}/docs/articles/${slug}`);
  if (!res.ok) throw new Error("Article not found");
  const json = await res.json();
  return json.data;
}

// Renderiza el contenido con soporte básico de markdown:
// ## Encabezados, **negrita**, `código`, - listas, bloques ```código```
function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Bloque de código
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-muted rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono">
          {lang && <span className="text-xs text-muted-foreground block mb-2">{lang}</span>}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-2xl font-bold mt-8 mb-3 text-foreground">
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-xl font-semibold mt-6 mb-2 text-foreground">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Lista
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1 my-3 text-muted-foreground">
          {listItems.map((item, idx) => (
            <li key={idx}>{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Lista numerada
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-1 my-3 text-muted-foreground">
          {listItems.map((item, idx) => (
            <li key={idx}>{inlineFormat(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Línea vacía
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Párrafo normal
    elements.push(
      <p key={i} className="text-muted-foreground leading-7 my-2">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
}

// Formatea inline: **negrita**, `código`
function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, isError } = useQuery<DocArticle>({
    queryKey: ["doc-article", slug],
    queryFn: () => fetchArticle(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-xl font-medium">Artículo no encontrado</p>
        <Button asChild variant="outline">
          <Link to="/help">Volver al Centro de Ayuda</Link>
        </Button>
      </div>
    );
  }

  const updatedDate = new Date(article.updated_at).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Back button */}
        <Button asChild variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
          <Link to="/help">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Centro de Ayuda
          </Link>
        </Button>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="secondary">
            <Book className="w-3 h-3 mr-1" />
            {CATEGORY_LABELS[article.category] ?? article.category}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Actualizado el {updatedDate}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-heading font-bold mb-4 text-foreground leading-tight">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg text-muted-foreground mb-8 border-l-4 border-primary pl-4">
            {article.excerpt}
          </p>
        )}

        <hr className="border-border mb-8" />

        {/* Content */}
        <article className="prose-custom">
          {renderContent(article.content)}
        </article>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-12 pt-6 border-t border-border text-center">
          <Button asChild variant="outline">
            <Link to="/help">← Volver al Centro de Ayuda</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
