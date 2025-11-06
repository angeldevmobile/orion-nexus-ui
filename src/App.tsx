import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./contexts/ProjectContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AIChat from "./pages/AIChat";
import Editor from "./pages/Editor";
import Components from "./pages/Components";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Community from "./pages/Community";
import History from "./pages/History";
import Help from "./pages/Help";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/components" element={<Components />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/community" element={<Community />} />
            <Route path="/history" element={<History />} />
            <Route path="/help" element={<Help />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
