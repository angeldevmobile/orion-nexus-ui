import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProjectProvider } from "./contexts/ProjectContext";
import { ChatProvider } from "./contexts/ChatContext";
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
import { Header } from "./components/layout/Header";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./contexts/ProtectedRoute";
import AuthCallback from "./hooks/authCallback";

const queryClient = new QueryClient();

const AppContent = () => {
	const location = useLocation();
	const hideHeader = ["/auth", "/auth/callback", "/ai-chat", "/editor"].includes(location.pathname);
	return (
		<>
			{!hideHeader && <Header />}
			<Routes>
				<Route path="/" element={<Index />} />
				<Route path="/auth" element={<Auth />} />
				<Route path="/auth/callback" element={<AuthCallback />} />
				{/* Rutas protegidas */}
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/ai-chat"
					element={
						<ProtectedRoute>
							<AIChat />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/editor"
					element={
						<ProtectedRoute>
							<Editor />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/components"
					element={
						<ProtectedRoute>
							<Components />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/projects"
					element={
						<ProtectedRoute>
							<Projects />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/settings"
					element={
						<ProtectedRoute>
							<Settings />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/pricing"
					element={
						<ProtectedRoute>
							<Pricing />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/community"
					element={
						<ProtectedRoute>
							<Community />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/history"
					element={
						<ProtectedRoute>
							<History />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/help"
					element={
						<ProtectedRoute>
							<Help />
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<NotFound />} />
			</Routes>
		</>
	);
};

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<ProjectProvider>
				<ChatProvider>
					<AuthProvider>
						<Toaster />
						<Sonner />
						<BrowserRouter>
							<AppContent />
						</BrowserRouter>
					</AuthProvider>
				</ChatProvider>
			</ProjectProvider>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
