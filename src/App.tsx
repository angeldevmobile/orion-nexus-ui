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
import ArticleDetail from "./pages/ArticleDetail";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import { Header } from "./components/layout/Header";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute, { AdminRoute } from "./contexts/ProtectedRoute";
import AuthCallback from "./hooks/authCallback";

const queryClient = new QueryClient();

const AppContent = () => {
	const location = useLocation();
	const hideHeader = ["/auth", "/login", "/register", "/auth/callback", "/reset-password", "/verify-email", "/ai-chat", "/editor", "/projects", "/dashboard", "/components", "/settings", "/pricing", "/community", "/history", "/help", "/admin", "/privacy", "/terms", "/cookies"].includes(location.pathname) || location.pathname.startsWith("/help/articles/");
	return (
		<>
			{!hideHeader && <Header />}
			<Routes>
				<Route path="/" element={<Index />} />
				<Route path="/auth" element={<Auth />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/auth/callback" element={<AuthCallback />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="/verify-email" element={<VerifyEmail />} />
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
				<Route
					path="/admin"
					element={
						<AdminRoute>
							<Admin />
						</AdminRoute>
					}
				/>
				<Route path="/help/articles/:slug" element={<ArticleDetail />} />
				<Route path="/privacy" element={<Privacy />} />
				<Route path="/terms" element={<Terms />} />
				<Route path="/cookies" element={<Cookies />} />
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
