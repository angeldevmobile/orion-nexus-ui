import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Search, Book, Video, MessageCircle, Mail, FileText, Zap } from "lucide-react";

export default function Help() {
  const categories = [
    { name: "Primeros Pasos", icon: Zap, count: 8 },
    { name: "Tutoriales", icon: Video, count: 15 },
    { name: "Documentación", icon: Book, count: 42 },
    { name: "FAQs", icon: HelpCircle, count: 28 },
  ];

  const faqs = [
    {
      question: "¿Cómo empiezo a crear mi primer proyecto?",
      answer: "Ve al Chat IA y describe lo que quieres construir. Por ejemplo: 'Crea una página de login moderna'. El asistente generará el código automáticamente.",
    },
    {
      question: "¿Qué frameworks son compatibles?",
      answer: "Orion Builder soporta React, Vue, Angular, Flutter y HTML/CSS puro. Puedes especificar el framework en tu prompt o en la configuración del proyecto.",
    },
    {
      question: "¿Cómo funciona el sistema de créditos?",
      answer: "Los créditos se consumen al usar generación IA. El plan Free incluye 100 créditos/mes, Pro 1,000 créditos/mes, y Enterprise tiene créditos ilimitados.",
    },
    {
      question: "¿Puedo exportar mi código?",
      answer: "Sí, puedes exportar tu proyecto completo en cualquier momento. Ve a tu proyecto y haz clic en 'Exportar' para descargar todo el código fuente.",
    },
    {
      question: "¿Cómo colaboro con mi equipo?",
      answer: "Invita miembros a tu workspace desde Configuración > Equipo. Los colaboradores podrán ver y editar proyectos compartidos en tiempo real.",
    },
  ];

  const quickLinks = [
    { title: "Guía de inicio rápido", icon: Zap, color: "text-primary" },
    { title: "Tutoriales en video", icon: Video, color: "text-purple-500" },
    { title: "Documentación API", icon: FileText, color: "text-green-500" },
    { title: "Comunidad Discord", icon: MessageCircle, color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 pt-24">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-heading font-bold mb-4 flex items-center justify-center gap-2">
                <HelpCircle className="w-10 h-10 text-primary" />
                Centro de Ayuda
              </h1>
              <p className="text-xl text-muted-foreground">
                ¿En qué podemos ayudarte hoy?
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-12">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Busca tutoriales, documentación, preguntas..."
                  className="pl-12 h-14 text-lg bg-card border-border"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">{category.name}</h3>
                    <Badge variant="secondary">{category.count} artículos</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Links */}
            <Card className="bg-card border-border mb-12">
              <CardHeader>
                <CardTitle>Enlaces Rápidos</CardTitle>
                <CardDescription>Recursos más utilizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickLinks.map((link) => (
                    <Button
                      key={link.title}
                      variant="outline"
                      className="h-auto py-4 justify-start"
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
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-2">
                  ¿No encuentras lo que buscas?
                </h3>
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
