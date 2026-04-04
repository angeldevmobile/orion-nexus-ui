import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Code2,
	Save,
	Download,
	Settings2,
	FileCode,
	Layout,
	Plus,
	Sparkles,
	Trash2,
	FolderOpen,
} from "lucide-react";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
	updateFilesInContainer,
} from "@/editor/runtime/orionContainer";
import { PROJECT_TEMPLATES, type ProjectTemplate } from "@/editor/templates";
import { authService } from "@/service/AuthService";
import { apiService } from "@/service/ApiService";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";

export default function Editor() {
	const {
		files,
		activeFile,
		setActiveFile: setProjectActiveFile,
	} = useProject();

	const [localActiveFile, setLocalActiveFile] = useState(activeFile);
	const [configOpen, setConfigOpen] = useState(false);
	const [editedContent, setEditedContent] = useState("");
	const [tree, setTree] = useState<FileNode[]>([]);
	const [hasProject, setHasProject] = useState<boolean | null>(null); // null = loading
	const [consoleLines, setConsoleLines] = useState<string[]>([]);
	const [searchParams] = useSearchParams();
	const templateParam = searchParams.get("template");

	const [selectedTemplate, setSelectedTemplate] =
		useState<string>(templateParam && PROJECT_TEMPLATES[templateParam] ? templateParam : "react-vite");
	const [creating, setCreating] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [serverUrl, setServerUrl] = useState<string | null>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [activeTab, setActiveTab] = useState("code");
	const { toast } = useToast();
	const location = useLocation();
	const navigate = useNavigate();
	const { user, token } = useAuth();
	const { autoFixError, uiData } = useChat();
	const prefs = user?.preferences as Record<string, unknown> | undefined;
	const editorFontFamily = prefs?.editorFont
		? String(prefs.editorFont)
		: "Fira Code";
	const editorFontSize = prefs?.editorFontSize
		? Number(prefs.editorFontSize)
		: 14;
	const editorTheme = prefs?.editorTheme
		? String(prefs.editorTheme)
		: "VS Code Dark";
	const editorAutocomplete =
		prefs?.autocomplete !== undefined ? Boolean(prefs.autocomplete) : true;

	// ── Presence ─────────────────────────────────────────────────────────────────
	interface PresenceUser { user_id: number; username: string; email: string; avatar?: string; color: string }
	const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
	// Derive a stable project slug from the first file path
	const presenceProjectId = useRef<string>(`editor-${user?.id ?? "anon"}`);

	useEffect(() => {
		if (!user || !token) return;
		const projectId = presenceProjectId.current;
		const headers: Record<string, string> = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

		const sendHeartbeat = () => {
			fetch(`http://localhost:5000/api/team/presence/${projectId}`, {
				method: "POST",
				headers,
			}).catch(() => {/* silent */});
		};

		const fetchPresence = () => {
			fetch(`http://localhost:5000/api/team/presence/${projectId}`, { headers })
				.then((r) => r.json())
				.then((d) => { if (d.success) setPresenceUsers(d.data || []); })
				.catch(() => {/* silent */});
		};

		sendHeartbeat();
		fetchPresence();
		const interval = setInterval(() => { sendHeartbeat(); fetchPresence(); }, 10_000);
		return () => clearInterval(interval);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id, token]);

	// On mount: check if a project already exists in the virtual FS
	useEffect(() => {
		(async () => {
			try {
				const entries = await fileManager.listDir("/");
				setHasProject(entries.length > 0);
				if (entries.length > 0) {
					const allPaths = await getAllFilePaths("/");
					setTree(buildFileTree(allPaths));
				}
			} catch {
				setHasProject(false);
			}
		})();
	}, []);

	// Sync active file content
	useEffect(() => {
		setLocalActiveFile(activeFile);
	}, [activeFile]);
	useEffect(() => {
		const file = files.find((f) => f.name === localActiveFile);
		if (file) setEditedContent(file.content);
	}, [localActiveFile, files]);

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

		const toArray = (obj: Record<string, TreeNode>): FileNode[] =>
			Object.values(obj).map((n) => ({
				name: n.name,
				path: n.path,
				type: n.type,
				...(n.children ? { children: toArray(n.children) } : {}),
			}));

		return toArray(root);
	};

	const handleCreateProject = async () => {
		setCreating(true);
		setConsoleLines(["📦 Creando proyecto..."]);
		try {
			await fileManager.clearDirectory("/");
			const template = PROJECT_TEMPLATES[selectedTemplate];
			if (!template)
				throw new Error(`Template ${selectedTemplate} no encontrado`);

			setConsoleLines((l) => [
				...l,
				`${(template as ProjectTemplate).icon} Usando template: ${
					(template as ProjectTemplate).name
				}`,
			]);
			const projectFiles = await (template as ProjectTemplate).createProject();

			for (const [path, content] of Object.entries(projectFiles)) {
				await fileManager.writeFile(path, content);
				setConsoleLines((l) => [...l, `✅ ${path}`]);
			}

			await reloadTree();
			const firstFile = "/src/App.tsx";
			setLocalActiveFile(firstFile);
			setProjectActiveFile(firstFile);
			const content = await fileManager.readFile(firstFile);
			setEditedContent(content);

			setHasProject(true);
			toast({
				title: "Proyecto creado",
				description: `${(template as ProjectTemplate).name} listo`,
			});

			// Guardar en base de datos (silencioso si no hay sesión activa)
			const TEMPLATE_SETTINGS: Record<string, { framework: string; language: string }> = {
				"react-vite":   { framework: "react",   language: "typescript" },
				"react-nextjs": { framework: "react",   language: "typescript" },
				"vanilla-html": { framework: "vanilla", language: "javascript" },
			};
			const settings = TEMPLATE_SETTINGS[selectedTemplate] ?? { framework: "vanilla", language: "javascript" };
			apiService
				.post("/projects", {
					name: (template as ProjectTemplate).name,
					description: "",
					isPublic: false,
					settings,
				})
				.catch(() => {
					/* No autenticado o error de red — el proyecto existe localmente */
				});
		} catch (error) {
			setConsoleLines((l) => [...l, `❌ Error: ${error}`]);
			toast({
				title: "Error",
				description: String(error),
				variant: "destructive",
			});
		} finally {
			setCreating(false);
		}
	};

	const handleNewProject = async () => {
		await fileManager.clearDirectory("/");
		setTree([]);
		setEditedContent("");
		setLocalActiveFile("");
		setConsoleLines([]);
		setHasProject(false);
	};

	const handleFileSelect = async (path: string) => {
		setLocalActiveFile(path);
		setProjectActiveFile(path);
		const content = await fileManager.readFile(path);
		setEditedContent(content);
	};

	const handleSave = async () => {
		await fileManager.writeFile(localActiveFile, editedContent);
		toast({ title: "Guardado", description: `${localActiveFile} guardado.` });
		await reloadTree();
		// Push al WebContainer para HMR (si el servidor ya está corriendo)
		if (serverUrl && localActiveFile) {
			updateFilesInContainer({ [localActiveFile]: editedContent }).catch(() => {});
		}
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
		if (isRunning) return;
		setIsRunning(true);
		setConsoleLines([]);
		setActiveTab("console");
		try {
			const snapshot = await dumpFsToJson();
			await initWebContainer(snapshot);
			await installDependencies((log) => setConsoleLines((l) => [...l, log]));
			const url = await runDevServer(
				(log) => setConsoleLines((l) => [...l, log]),
				// Auto-fix Vite errors via AI
				async (error) => {
					setConsoleLines((l) => [...l, `⚠️ Error detectado — corrigiendo con IA...`]);
					await autoFixError(
						`Corrige este error de Vite:\n\`\`\`\n${error}\n\`\`\`\n\nEl archivo activo es: ${localActiveFile}`
					);
					// Push corrected files from AI back into the container
					const fixed = uiData?.files ?? [];
					if (fixed.length > 0) {
						const patch: Record<string, string> = {};
						for (const f of fixed) {
							const p = f.path.startsWith('/') ? f.path : `/${f.path}`;
							patch[p] = f.content;
							await fileManager.writeFile(p, f.content).catch(() => {});
						}
						await updateFilesInContainer(patch);
						setConsoleLines((l) => [...l, `✅ ${fixed.length} archivos corregidos — Vite HMR aplicando cambios`]);
					}
				}
			);
			setServerUrl(url);
			if (iframeRef.current) iframeRef.current.src = url;
			setActiveTab("preview");
		} catch (err) {
			setConsoleLines((l) => [...l, `❌ Error: ${err}`]);
		} finally {
			setIsRunning(false);
		}
	};

	// Ctrl+S → guardar
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				if (localActiveFile) handleSave();
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [localActiveFile, editedContent, serverUrl]);

	// Auto-run whenever a project becomes available (template link or existing project)
	useEffect(() => {
		if (hasProject === false && templateParam && PROJECT_TEMPLATES[templateParam]) {
			// Came from "Usar plantilla" — create then run
			handleCreateProject().then(() => handleRun());
		} else if (hasProject === true && !serverUrl) {
			// Existing project loaded — auto-run
			handleRun();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasProject]);

	// ── Loading state ────────────────────────────────────────────────────────────
	if (hasProject === null) {
		return (
			<div className="h-screen bg-background flex overflow-hidden">
				<IconSidebar />
				<div className="flex-1 flex items-center justify-center">
					<div className="flex items-center gap-3 text-muted-foreground">
						<div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
						<span className="text-sm">Cargando espacio de trabajo...</span>
					</div>
				</div>
			</div>
		);
	}

	// ── Empty state: no active project → redirect to creation flow ──────────────
	if (!hasProject) {
		return (
			<div className="h-screen bg-background flex overflow-hidden">
				<IconSidebar />

				<div className="flex-1 flex items-center justify-center p-8">
					<div className="w-full max-w-xs text-center space-y-6">
						<div className="w-16 h-16 rounded-2xl bg-muted/30 border border-border flex items-center justify-center mx-auto">
							<Code2 className="w-8 h-8 text-muted-foreground/50" />
						</div>

						<div className="space-y-2">
							<h1 className="font-heading font-semibold text-lg">
								No hay proyecto activo
							</h1>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Crea o abre un proyecto para empezar a editar código.
							</p>
						</div>

						<div className="space-y-2.5">
							<Button
								className="w-full bg-primary hover:bg-primary/90"
								onClick={() => navigate("/projects")}>
								<FolderOpen className="w-4 h-4 mr-2" />
								Mis Proyectos
							</Button>
							<Button
								variant="outline"
								className="w-full"
								onClick={() => navigate("/ai-chat")}>
								<Sparkles className="w-4 h-4 mr-2 text-primary" />
								Generar con IA
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// ── Full editor (project exists) ─────────────────────────────────────────────
	return (
		<div className="h-screen bg-background flex overflow-hidden">
			<IconSidebar />

			{/* File Explorer */}
			<div className="w-56 flex-shrink-0 border-r border-border bg-card flex flex-col">
				<div className="px-3 py-3 border-b border-border space-y-2">
					<div className="flex items-center justify-between">
						<h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
							<FileCode className="w-3.5 h-3.5" />
							Archivos
						</h2>
						<button
							title="Cerrar proyecto"
							onClick={handleNewProject}
							className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
							<Trash2 className="w-3.5 h-3.5" />
						</button>
					</div>

					{/* New project from template */}
					<Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
						<SelectTrigger className="w-full h-8 text-xs bg-background">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(PROJECT_TEMPLATES).map(([key, tpl]) => (
								<SelectItem key={key} value={key} className="text-xs">
									{(tpl as ProjectTemplate).icon} {(tpl as ProjectTemplate).name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						size="sm"
						variant="outline"
						className="w-full h-7 text-xs"
						onClick={handleCreateProject}
						disabled={creating}>
						{creating ? (
							<>
								<div className="w-3 h-3 rounded-full border-2 border-muted-foreground/40 border-t-foreground animate-spin mr-1.5" />
								Creando...
							</>
						) : (
							<>
								<Layout className="w-3 h-3 mr-1.5" />
								Nuevo Proyecto
							</>
						)}
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

			{/* Editor area */}
			<div className="flex-1 flex flex-col min-w-0">
				{/* Top bar */}
				<div className="flex-shrink-0 border-b border-border px-4 py-2.5 bg-card flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Code2 className="w-4 h-4 text-primary" />
						<span className="font-heading font-semibold text-sm">Editor</span>
						{localActiveFile && (
							<Badge variant="secondary" className="text-xs font-mono">
								{localActiveFile}
							</Badge>
						)}
					</div>

					{/* ── Presence avatars ── */}
					{presenceUsers.length > 0 && (
						<div className="flex items-center gap-1.5 mr-2">
							<span className="text-xs text-muted-foreground mr-1">Editando:</span>
							<TooltipProvider delayDuration={150}>
								<div className="flex -space-x-2">
									{presenceUsers.slice(0, 6).map((pu) => (
										<Tooltip key={pu.user_id}>
											<TooltipTrigger asChild>
												<div
													className="relative w-7 h-7 rounded-full border-2 cursor-default"
													style={{ borderColor: pu.color }}
												>
													<Avatar className="w-full h-full">
														<AvatarImage src={pu.avatar} />
														<AvatarFallback
															className="text-[10px] font-bold"
															style={{ background: pu.color + "33", color: pu.color }}
														>
															{(pu.username ?? pu.email ?? "?").slice(0, 2).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													{/* live pulse dot */}
													<span
														className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card animate-pulse"
														style={{ background: pu.color }}
													/>
												</div>
											</TooltipTrigger>
											<TooltipContent side="bottom" className="text-xs px-2 py-1">
												{pu.username ?? pu.email}
												<span className="ml-1 opacity-60 capitalize">({pu.user_id === parseInt(String(user?.id ?? "0")) ? "tú" : "editor"})</span>
											</TooltipContent>
										</Tooltip>
									))}
									{presenceUsers.length > 6 && (
										<div className="w-7 h-7 rounded-full border-2 border-border bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
											+{presenceUsers.length - 6}
										</div>
									)}
								</div>
							</TooltipProvider>
						</div>
					)}

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
										Convierte y exporta tu proyecto a diferentes lenguajes y
										frameworks
									</DialogDescription>
								</DialogHeader>

								<div className="space-y-6 py-4">
									<div className="space-y-4">
										<Label className="text-base font-semibold">
											Exportar como:
										</Label>
										<div className="grid grid-cols-2 gap-3">
											{[
												{ name: "React", icon: "⚛️" },
												{ name: "HTML/CSS/JS", icon: "🌐" },
												{ name: "Flutter", icon: "📱" },
												{ name: "Vue.js", icon: "💚" },
												{ name: "Angular", icon: "🅰️" },
												{ name: "Next.js", icon: "▲" },
												{ name: "Svelte", icon: "🔥" },
												{ name: "AppScript", icon: "📜" },
											].map((fw) => (
												<Button
													key={fw.name}
													variant="outline"
													className="justify-start h-auto py-3 hover:bg-primary/10 hover:border-primary">
													<span className="text-2xl mr-3">{fw.icon}</span>
													<span className="font-medium">{fw.name}</span>
												</Button>
											))}
										</div>
									</div>

									<div className="pt-4 border-t border-border space-y-4">
										<Label className="text-base font-semibold block">
											Opciones:
										</Label>
										{[
											{
												label: "Incluir dependencias",
												sub: "package.json con todas las librerías",
												def: true,
											},
											{
												label: "Minificar código",
												sub: "Optimizar para producción",
												def: true,
											},
											{
												label: "Comentarios",
												sub: "Documentación automática",
												def: false,
											},
											{
												label: "TypeScript",
												sub: "Usar TypeScript en lugar de JavaScript",
												def: true,
											},
										].map((opt) => (
											<div
												key={opt.label}
												className="flex items-center justify-between">
												<div>
													<p className="font-medium text-sm">{opt.label}</p>
													<p className="text-xs text-muted-foreground">
														{opt.sub}
													</p>
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
										<Button
											variant="outline"
											className="flex-1"
											onClick={() => setConfigOpen(false)}>
											Cancelar
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>

						<Button
							variant="outline"
							size="sm"
							className="h-7 text-xs"
							onClick={handleSave}>
							<Save className="w-3.5 h-3.5 mr-1.5" />
							Guardar
						</Button>
					{/* Estado del servidor — solo lectura */}
					{isRunning && (
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<div className="w-3 h-3 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
							Iniciando...
						</div>
					)}
					{serverUrl && !isRunning && (
						<div className="flex items-center gap-1.5 text-xs text-green-500">
							<div className="w-2 h-2 rounded-full bg-green-500" />
							Servidor activo
						</div>
					)}
					</div>
				</div>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
					<div className="flex-shrink-0 border-b border-border bg-card px-4">
						<TabsList className="h-9">
							<TabsTrigger value="code" className="text-xs">
								Código
							</TabsTrigger>
							<TabsTrigger value="preview" className="text-xs">
								Vista Previa
							</TabsTrigger>
							<TabsTrigger value="console" className="text-xs">
								Consola
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="code" className="flex-1 m-0 overflow-hidden">
						{localActiveFile ? (
							<MonacoEditor
								filePath={localActiveFile}
								code={editedContent}
								onChange={setEditedContent}
								fontFamily={editorFontFamily}
								fontSize={editorFontSize}
								editorTheme={editorTheme}
								autocomplete={editorAutocomplete}
							/>
						) : (
							<div className="h-full flex items-center justify-center text-muted-foreground">
								<div className="text-center space-y-2">
									<FileCode className="w-10 h-10 mx-auto opacity-30" />
									<p className="text-sm">Selecciona un archivo para editar</p>
								</div>
							</div>
						)}
					</TabsContent>

					<TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
						{localActiveFile.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/i) ? (
							<div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-muted/20">
								<div className="bg-card rounded-lg p-6 shadow-lg">
									<img
										src={(() => {
											if (editedContent.startsWith("data:"))
												return editedContent;
											if (
												editedContent.trim().startsWith("<") ||
												localActiveFile.endsWith(".svg")
											)
												return `data:image/svg+xml;utf8,${encodeURIComponent(
													editedContent,
												)}`;
											const ext = localActiveFile
												.split(".")
												.pop()
												?.toLowerCase();
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
									<p className="text-muted-foreground text-xs">
										Consola vacía. Ejecuta el proyecto para ver los logs.
									</p>
								) : (
									<div className="space-y-1">
										{consoleLines.map((line, i) => (
											<p key={i} className="text-muted-foreground">
												{line}
											</p>
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
