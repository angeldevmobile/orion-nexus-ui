import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Code2, Eye, Download, Copy, Smartphone, Monitor, Tablet, Mic, MicOff, Github, GitBranch } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { useProject } from "@/contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import marketing1 from "@/assets/marketing-1.jpg";
import marketing2 from "@/assets/marketing-2.jpg";
import marketing3 from "@/assets/marketing-3.jpg";
import marketing4 from "@/assets/marketing-4.jpg";

const marketingSlides = [
  {
    image: marketing1,
    title: "Generación con IA",
    description: "Transforma tus ideas en código profesional con inteligencia artificial avanzada"
  },
  {
    image: marketing2,
    title: "Editor en Tiempo Real",
    description: "Edita y visualiza cambios instantáneamente con nuestro editor inteligente"
  },
  {
    image: marketing3,
    title: "Colaboración en Equipo",
    description: "Trabaja junto a tu equipo en proyectos compartidos en tiempo real"
  },
  {
    image: marketing4,
    title: "Deploy Instantáneo",
    description: "Despliega tus aplicaciones a la nube con un solo clic"
  }
];

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isListening, setIsListening] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente de IA. Describe la aplicación que quieres construir y te ayudaré a crearla. Por ejemplo: 'Crea una página de login moderna con colores BBVA'",
    },
  ]);
  const { setGeneratedPreview, updateFileContent } = useProject();
  const navigate = useNavigate();

  // Auto-play carousel
  useEffect(() => {
    if (!carouselApi) return;

    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselApi]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessages([...messages, { role: "user", content: userMessage }]);
    setMessage("");
    
    // Simulate AI response and code generation
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "¡Perfecto! Voy a crear eso para ti. Generando componentes y estructura del proyecto..."
      }]);

      // Simulate generated code based on user request
      const generatedCode = `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Código generado basado en: ${userMessage}
export default function GeneratedApp() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">
          ${userMessage}
        </h1>
        <p className="text-muted-foreground mb-6">
          Esta interfaz fue generada con IA
        </p>
        <Button className="bg-primary hover:bg-primary/90">
          Comenzar
        </Button>
      </Card>
    </div>
  );
}`;

      // Update the project context with generated code
      updateFileContent("App.tsx", generatedCode);
      setGeneratedPreview(generatedCode);
    }, 1000);
  };

  const deviceSizes = {
    desktop: "w-full h-full",
    tablet: "w-[768px] h-[1024px] mx-auto",
    mobile: "w-[375px] h-[667px] mx-auto"
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        
        {/* Split View: Chat + Preview */}
        <main className="flex-1 ml-64 pt-16">
          <div className="flex h-[calc(100vh-4rem)]">
            
            {/* Left Side: AI Chat */}
            <div className="w-2/5 border-r border-border flex flex-col bg-card">
              <div className="p-6 border-b border-border">
                <h1 className="text-2xl font-heading font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  AI Builder
                </h1>
                <p className="text-sm text-muted-foreground">
                  Describe tu proyecto y observa cómo cobra vida
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ej: 'Crea un dashboard con gráficas de ventas'"
                    className="min-h-[80px] bg-background border-border resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => setIsListening(!isListening)}
                      size="lg"
                      variant={isListening ? "destructive" : "outline"}
                      className={`h-[80px] px-6 ${isListening ? "animate-pulse" : ""}`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Button 
                      onClick={handleSend}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 h-[80px] px-6"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* GitHub/Bitbucket Integration */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Github className="w-4 h-4 mr-2" />
                    Clonar a GitHub
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Clonar a Bitbucket
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side: Live Preview */}
            <div className="flex-1 flex flex-col bg-background">
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <Tabs defaultValue="preview" className="w-auto">
                    <TabsList>
                      <TabsTrigger value="preview" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Vista Previa
                      </TabsTrigger>
                      <TabsTrigger value="code" className="gap-2">
                        <Code2 className="w-4 h-4" />
                        Código
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-2">
                    {/* Device Selector */}
                    <div className="flex gap-1 p-1 bg-secondary rounded-lg">
                      <Button
                        variant={device === "desktop" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setDevice("desktop")}
                        className="h-8 w-8 p-0"
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={device === "tablet" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setDevice("tablet")}
                        className="h-8 w-8 p-0"
                      >
                        <Tablet className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={device === "mobile" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setDevice("mobile")}
                        className="h-8 w-8 p-0"
                      >
                        <Smartphone className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate("/editor")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Code2 className="w-4 h-4 mr-2" />
                      Editar en Editor
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              <div className="flex-1 overflow-auto p-6 bg-muted/20">
                <Card className={`${deviceSizes[device]} bg-background border-2 border-border shadow-2xl transition-all duration-300`}>
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-6">
                      <Carousel 
                        className="w-full"
                        setApi={setCarouselApi}
                        opts={{
                          loop: true,
                        }}
                      >
                        <CarouselContent>
                          {marketingSlides.map((slide, index) => (
                            <CarouselItem key={index}>
                              <div className="space-y-4">
                                <div className="aspect-square rounded-2xl overflow-hidden border-2 border-border bg-card">
                                  <img 
                                    src={slide.image} 
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-center space-y-2">
                                  <h3 className="text-xl font-heading font-bold">
                                    {slide.title}
                                  </h3>
                                  <p className="text-muted-foreground text-sm">
                                    {slide.description}
                                  </p>
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                      
                      <div className="text-center">
                        <Badge className="bg-primary/10 text-primary animate-pulse">
                          ✨ Empieza a construir ahora
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
