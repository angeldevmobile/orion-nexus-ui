import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
	Code2,
	Play,
	Save,
	Download,
	Settings2,
	FileCode,
	Layout,
	Home,
	MessageSquare,
	FolderOpen,
	Settings,
	Rocket,
	Upload,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FileExplorer from "@/editor/FileExplorer";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/hooks/useProject";
import MonacoEditor from "../editor/MonacoEditor";
import { fileManager } from "@/editor/FileManager";
import { FileNode } from "@/editor/FileExplorer";
import { dumpFsToJson } from "@/editor/fileSystem/lightningFsAdapter";
import {
	initWebContainer,
	installDependencies,
	runDevServer,
} from "@/editor/runtime/orionContainer";
import { PROJECT_TEMPLATES, type ProjectTemplate } from "@/editor/templates";
import { authService } from "@/service/AuthService";

const NAV_ITEMS = [
	{ to: "/dashboard",  icon: Home,          label: "Dashboard" },
	{ to: "/ai-chat",    icon: MessageSquare, label: "AI Chat" },
	{ to: "/editor",     icon: Code2,         label: "Editor" },
	{ to: "/projects",   icon: FolderOpen,    label: "Proyectos" },
	{ to: "/settings",   icon: Settings,      label: "Ajustes" },
];

export default function Editor() {
	const {
		files,
		activeFile,
		setActiveFile: setProjectActiveFile,
		updateFileContent,
	} = useProject();
	const [localActiveFile, setLocalActiveFile] = useState(activeFile);
	const [configOpen, setConfigOpen] = useState(false);
	const [editedContent, setEditedContent] = useState("");
	const [tree, setTree] = useState<FileNode[]>([]);
	const [consoleLines, setConsoleLines] = useState<string[]>([]);
	const [selectedTemplate, setSelectedTemplate] = useState<string>("react-vite");
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const { toast } = useToast();
	const location = useLocation();
	const navigate = useNavigate();

	// Create new project from selected template
	const handleCreateProject = async () => {
		setConsoleLines(["📦 Creando proyecto..."]);
		try {
			await fileManager.clearDirectory("/");
			const template = PROJECT_TEMPLATES[selectedTemplate];
			if (!template) throw new Error(`Template ${selectedTemplate} no encontrado`);

			setConsoleLines((lines) => [...lines, `${template.icon} Usando template: ${template.name}`]);
			const projectFiles = await template.createProject();

			for (const [path, content] of Object.entries(projectFiles)) {
				await fileManager.writeFile(path, content);
				setConsoleLines((lines) => [...lines, `✅ Creado: ${path}`]);
			}

			await reloadTree();
			setLocalActiveFile("/src/App.tsx");
			setProjectActiveFile("/src/App.tsx");
			setConsoleLines((lines) => [
				...lines,
				`🚀 ¡Proyecto ${template.name} creado!`,
				"💡 Haz clic en 'Ejecutar' para instalar dependencias",
			]);
			toast({ title: "Proyecto Creado", description: `${template.name} listo para desarrollar` });
		} catch (error) {
			setConsoleLines((lines) => [...lines, `❌ Error: ${error}`]);
		}
	};

	const reloadTree = async () => {
		try {
			const allPaths = await getAllFilePaths("/");
			setTree(buildFileTree(allPaths));
		} catch (error) {
			console.error("Error recargando árbol:", error);
		}
	};

	const getAllFilePaths = async (dir: string): Promise<string[]> => {
		const paths: string[] = [];
		try {
			const entries = await fileManager.listDir(dir);
			for (const entry of entries) {
				paths.push(entry.path);
				if (entry.type === "folder") {
					paths.push(...(await getAllFilePaths(entry.path)));
				}
			}
		} catch (error) {
			console.error(`Error leyendo ${dir}:`, error);
		}
		return paths;
	};

	const buildFileTree = (paths: string[]): FileNode[] => {
		interface TreeNode extends Omit<FileNode, "children"> {
			children?: Record<string, TreeNode>;
		}
		const root: Record<string, TreeNode> = {};

		paths.forEach((path) => {
			const parts = path.split("/").filter(Boolean);
			let current: Record<string, TreeNode> = root;

			parts.forEach((part, index) => {
				if (!current[part]) {
					const fullPath = "/" + parts.slice(0, index + 1).join("/");
					const isFile =
						index === parts.length - 1 &&
						!paths.some((p) => p.startsWith(fullPath + "/") && p !== fullPath);
					current[part] = {
						name: part,
						path: fullPath,
						type: isFile ? "file" : "folder",
						children: isFile ? undefined : {},
					};
				}
				if (current[part].children) {
					current = current[part].children as Record<string, TreeNode>;
				}
			});
		});

		const convertToArray = (obj: Record<string, TreeNode>): FileNode[] =>
			Object.values(obj).map((node) => ({
				name: node.name,
				path: node.path,
				type: node.type,
				...(node.children ? { children: convertToArray(node.children) } : {}),
			}));

		return convertToArray(root);
	};

	useEffect(() => { setLocalActiveFile(activeFile); }, [activeFile]);

	useEffect(() => {
		const file = files.find((f) => f.name === localActiveFile);
		if (file) setEditedContent(file.content);
	}, [localActiveFile, files]);

	useEffect(() => { reloadTree(); }, []);

	const handleFileSelect = async (path: string) => {
		setLocalActiveFile(path);
		setProjectActiveFile(path);
		const content = await fileManager.readFile(path);
		setEditedContent(content);
	};

	const handleSave = async () => {
		await fileManager.writeFile(localActiveFile, editedContent);
		toast({ title: "Guardado", description: `${localActiveFile} guardado correctamente.` });
		await reloadTree();
	};

	const handleCreateFile = async (name: string) => {
		await fileManager.createFile(`/${name}`);
		await reloadTree();
	};

	const handleCreateFolder = async (name: string) => {
		await fileManager.createFolder(`/${name}`);
		await reloadTree();
	};

	const handleRun = async () => {
		setConsoleLines([]);
		const snapshot = await dumpFsToJson();
		await initWebContainer(snapshot);
		await installDependencies((log) => setConsoleLines((lines) => [...lines, log]));
		await runDevServer((log) => {
			setConsoleLines((lines) => [...lines, log]);
			if (log.startsWith("🌍 Servidor listo en ")) {
				const url = log.split("en ")[1];
				if (iframeRef.current) iframeRef.current.src = url;
			}
		});
	};

	return (
		<div className="h-screen bg-background flex overflow-hidden">

			{/* ── Icon sidebar ─────────────────────────────────────────── */}
			<aside className="w-14 flex-shrink-0 flex flex-col items-center py-3 border-r border-border bg-card">
				<Link
					to="/"
					className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-5 hover:bg-primary/20 transition-colors"
					title="Inicio"
				>
					<Rocket className="w-4 h-4 text-primary" />
				</Link>

				<nav className="flex flex-col gap-1 flex-1">
					{NAV_ITEMS.map(({ to, icon: Icon, label }) => (
						<Link
							key={to}
							to={to}
							title={label}
							className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
								location.pathname === to
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-secondary hover:text-foreground"
							}`}
						>
							<Icon className="w-4 h-4" />
						</Link>
					))}
				</nav>

				{/* User avatar */}
				{(() => {
					const user = authService.getUser();
					const initials = (user?.username ?? user?.email ?? "?").slice(0, 2).toUpperCase();
					return (
						<div
							className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/40 to-violet-500/40 border border-primary/30 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity mb-1"
							title={user?.username ?? user?.email ?? "Usuario"}
							onClick={() => navigate("/settings")}
						>
							{user?.avatar
								? <img src={user.avatar} alt={initials} className="w-full h-full rounded-xl object-cover" />
								: initials}
						</div>
					);
				})()}

				<Button
					size="sm"
					onClick={() => navigate("/projects")}
					className="w-9 h-9 p-0 bg-primary hover:bg-primary/90"
					title="Proyectos"
				>
					<Upload className="w-4 h-4" />
				</Button>
			</aside>

			{/* ── File Explorer ─────────────────────────────────────────── */}
			<div className="w-56 flex-shrink-0 border-r border-border bg-card flex flex-col">
				<div className="px-3 py-3 border-b border-border">
					<h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
						<FileCode className="w-3.5 h-3.5" />
						Archivos
					</h2>
					<select
						value={selectedTemplate}
						onChange={(e) => setSelectedTemplate(e.target.value)}
						className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded-lg mb-2"
					>
						{Object.entries(PROJECT_TEMPLATES).map(([key, template]) => (
							<option key={key} value={key}>
								{(template as ProjectTemplate).icon} {(template as ProjectTemplate).name}
							</option>
						))}
					</select>
					<Button
						size="sm"
						variant="outline"
						className="w-full text-xs h-7"
						onClick={handleCreateProject}
					>
						<Layout className="w-3 h-3 mr-1.5" />
						Crear Proyecto
					</Button>
				</div>

				<div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
					<FileExplorer
						tree={tree}
						onOpenFile={handleFileSelect}
						onCreateFile={handleCreateFile}
						onCreateFolder={handleCreateFolder}
					/>
				</div>
			</div>

			{/* ── Editor area ───────────────────────────────────────────── */}
			<div className="flex-1 flex flex-col min-w-0">

				{/* Top bar */}
				<div className="flex-shrink-0 border-b border-border px-4 py-2.5 bg-card flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Code2 className="w-4 h-4 text-primary" />
						<span className="font-heading font-semibold text-sm">Editor</span>
						<Badge variant="secondary" className="text-xs font-mono">{localActiveFile}</Badge>
					</div>

					<div className="flex items-center gap-2">
						<Dialog open={configOpen} onOpenChange={setConfigOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="h-7 text-xs">
									<Settings2 className="w-3.5 h-3.5 mr-1.5" />
									Exportar
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>Exportar Proyecto</DialogTitle>
									<DialogDescription>
										Convierte y exporta tu proyecto a diferentes lenguajes y frameworks
									</DialogDescription>
								</DialogHeader>

								<div className="space-y-6 py-4">
									<div className="space-y-4">
										<Label className="text-base font-semibold">Exportar como:</Label>
										<div className="grid grid-cols-2 gap-3">
											{[
												{ name: "React",       icon: "⚛️" },
												{ name: "HTML/CSS/JS", icon: "🌐" },
												{ name: "Flutter",     icon: "📱" },
												{ name: "Vue.js",      icon: "💚" },
												{ name: "Angular",     icon: "🅰️" },
												{ name: "Next.js",     icon: "▲" },
												{ name: "Svelte",      icon: "🔥" },
												{ name: "AppScript",   icon: "📜" },
											].map((fw) => (
												<Button
													key={fw.name}
													variant="outline"
													className="justify-start h-auto py-3 hover:bg-primary/10 hover:border-primary"
												>
													<span className="text-2xl mr-3">{fw.icon}</span>
													<span className="font-medium">{fw.name}</span>
												</Button>
											))}
										</div>
									</div>

									<div className="pt-4 border-t border-border space-y-4">
										<Label className="text-base font-semibold block">Opciones:</Label>
										{[
											{ label: "Incluir dependencias", sub: "package.json con todas las librerías", def: true },
											{ label: "Minificar código",     sub: "Optimizar para producción",            def: true },
											{ label: "Comentarios",          sub: "Documentación automática",             def: false },
											{ label: "TypeScript",           sub: "Usar TypeScript en lugar de JavaScript", def: true },
										].map((opt) => (
											<div key={opt.label} className="flex items-center justify-between">
												<div>
													<p className="font-medium text-sm">{opt.label}</p>
													<p className="text-xs text-muted-foreground">{opt.sub}</p>
												</div>
												<Switch defaultChecked={opt.def} />
											</div>
										))}
									</div>

									<div className="pt-4 border-t border-border flex gap-3">
										<Button className="flex-1 bg-primary hover:bg-primary/90">
											<Download className="w-4 h-4 mr-2" />
											Exportar Proyecto
										</Button>
										<Button variant="outline" className="flex-1" onClick={() => setConfigOpen(false)}>
											Cancelar
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>

						<Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleSave}>
							<Save className="w-3.5 h-3.5 mr-1.5" />
							Guardar
						</Button>
						<Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90" onClick={handleRun}>
							<Play className="w-3.5 h-3.5 mr-1.5" />
							Ejecutar
						</Button>
					</div>
				</div>

				{/* Tabs */}
				<Tabs defaultValue="code" className="flex-1 flex flex-col min-h-0">
					<div className="flex-shrink-0 border-b border-border bg-card px-4">
						<TabsList className="h-9">
							<TabsTrigger value="code"    className="text-xs">Código</TabsTrigger>
							<TabsTrigger value="preview" className="text-xs">Vista Previa</TabsTrigger>
							<TabsTrigger value="console" className="text-xs">Consola</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="code" className="flex-1 m-0 overflow-hidden">
						<MonacoEditor
							filePath={localActiveFile}
							code={editedContent}
							onChange={setEditedContent}
						/>
					</TabsContent>

					<TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
						{localActiveFile.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/i) ? (
							<div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-muted/20">
								<div className="bg-card rounded-lg p-6 shadow-lg">
									<img
										src={(() => {
											if (editedContent.startsWith("data:")) return editedContent;
											if (editedContent.trim().startsWith("<") || localActiveFile.endsWith(".svg"))
												return `data:image/svg+xml;utf8,${encodeURIComponent(editedContent)}`;
											const ext = localActiveFile.split(".").pop()?.toLowerCase();
											const mime = ext === "ico" ? "x-icon" : ext;
											return `data:image/${mime};base64,${editedContent}`;
										})()}
										alt={localActiveFile}
										className="max-w-full max-h-[60vh] object-contain"
									/>
								</div>
								<p className="text-sm font-medium">{localActiveFile}</p>
							</div>
						) : (
							<iframe
								ref={iframeRef}
								id="preview-iframe"
								style={{ width: "100%", height: "100%", border: "none" }}
								title="Vista Previa"
							/>
						)}
					</TabsContent>

					<TabsContent value="console" className="flex-1 m-0 overflow-hidden">
						<div className="h-full bg-background p-4">
							<Card className="h-full bg-card border-border p-4 overflow-auto font-mono text-sm [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
								{consoleLines.length === 0 ? (
									<p className="text-muted-foreground text-xs">Consola vacía. Ejecuta el proyecto para ver los logs.</p>
								) : (
									<div className="space-y-1">
										{consoleLines.map((line, i) => (
											<p key={i} className="text-muted-foreground">{line}</p>
										))}
									</div>
								)}
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
