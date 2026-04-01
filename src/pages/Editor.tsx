import { Sidebar } from "@/components/layout/Sidebar";
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
	Palette,
	Plus,
	FolderPlus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
import { runProject } from "@/editor/runProject";

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
	const [selectedTemplate, setSelectedTemplate] =
		useState<string>("react-vite");
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [isRunning, setIsRunning] = useState(false);
	const [logs, setLogs] = useState<string[]>([]);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const { toast } = useToast();

	// Crear nuevo proyecto con estructura completa
	const handleCreateProject = async () => {
		setConsoleLines(["📦 Creando proyecto..."]);

		try {
			await fileManager.clearDirectory("/");

			const template = PROJECT_TEMPLATES[selectedTemplate];
			if (!template) {
				throw new Error(`Template ${selectedTemplate} no encontrado`);
			}

			setConsoleLines((lines) => [
				...lines,
				`${template.icon} Usando template: ${template.name}`,
			]);

			// Crear proyecto desde template
			const projectFiles = await template.createProject();

			// Crear archivos
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

			toast({
				title: "Proyecto Creado",
				description: `${template.name} listo para desarrollar`,
			});
		} catch (error) {
			setConsoleLines((lines) => [...lines, ` Error: ${error}`]);
		}
	};

	// Refresca el árbol de archivos construyendo jerarquía
	const reloadTree = async () => {
		try {
			// Obtener todos los archivos y carpetas
			const allPaths = await getAllFilePaths("/");

			// Construir árbol jerárquico
			const tree = buildFileTree(allPaths);

			setTree(tree);
		} catch (error) {
			console.error("Error recargando árbol:", error);
		}
	};

	// Obtener todas las rutas recursivamente
	const getAllFilePaths = async (dir: string): Promise<string[]> => {
		const paths: string[] = [];

		try {
			const entries = await fileManager.listDir(dir);

			for (const entry of entries) {
				const fullPath = entry.path;
				paths.push(fullPath);

				// Si es carpeta, obtener contenido recursivamente
				if (entry.type === "folder") {
					const subPaths = await getAllFilePaths(fullPath);
					paths.push(...subPaths);
				}
			}
		} catch (error) {
			console.error(`Error leyendo ${dir}:`, error);
		}

		return paths;
	};

	// Construir árbol jerárquico desde lista de rutas
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
					current = current[part].children;
				}
			});
		});

		// Convertir objeto a array
		const convertToArray = (obj: Record<string, TreeNode>): FileNode[] => {
			return Object.values(obj).map((node) => {
				if (node.children && typeof node.children === "object") {
					return {
						name: node.name,
						path: node.path,
						type: node.type,
						children: convertToArray(node.children),
					};
				}
				return {
					name: node.name,
					path: node.path,
					type: node.type,
				};
			});
		};

		return convertToArray(root);
	};

	useEffect(() => {
		setLocalActiveFile(activeFile);
	}, [activeFile]);

	useEffect(() => {
		const file = files.find((f) => f.name === localActiveFile);
		if (file) {
			setEditedContent(file.content);
		}
	}, [localActiveFile, files]);

	useEffect(() => {
		reloadTree(); // Cargar árbol al montar
	}, []);

	// Selección de archivo: lee del FS virtual
	const handleFileSelect = async (path: string) => {
		setLocalActiveFile(path);
		setProjectActiveFile(path);
		const content = await fileManager.readFile(path);
		setEditedContent(content);
	};

	// Guardar archivo: escribe en el FS virtual y refresca árbol
	const handleSave = async () => {
		await fileManager.writeFile(localActiveFile, editedContent);
		toast({
			title: "Guardado exitoso",
			description: `${localActiveFile} ha sido guardado correctamente.`,
		});
		await reloadTree();
	};

	// Crear archivo y refresca árbol
	const handleCreateFile = async (name: string) => {
		await fileManager.createFile(`/${name}`);
		await reloadTree();
	};

	// Crear carpeta y refresca árbol
	const handleCreateFolder = async (name: string) => {
		await fileManager.createFolder(`/${name}`);
		await reloadTree();
	};

	// Ejecutar proyecto con WebContainer
	const handleRun = async () => {
		setConsoleLines([]); // Limpia consola
		const snapshot = await dumpFsToJson();
		await initWebContainer(snapshot);
		await installDependencies((log) =>
			setConsoleLines((lines) => [...lines, log])
		);
		await runDevServer((log) => {
			setConsoleLines((lines) => [...lines, log]);
			// Detecta URL y actualiza iframe
			if (log.startsWith("🌍 Servidor listo en ")) {
				const url = log.split("en ")[1];
				if (iframeRef.current) iframeRef.current.src = url;
			}
		});
	};

	// Función para ejecutar el proyecto
	const handleRunProject = async () => {
		try {
			setIsRunning(true);
			setLogs([]); // Limpiar logs anteriores

			const serverUrl = await runProject((message) => {
				// Agregar cada log al estado
				setLogs((prev) => [...prev, message]);
				console.log(message);
			});

			if (serverUrl) {
				setPreviewUrl(serverUrl);
				toast({
					title: "✅ Proyecto ejecutándose",
					description: `Servidor disponible en ${serverUrl}`,
				});
			}
		} catch (error) {
			console.error("Error:", error);
			toast({
				title: "❌ Error",
				description:
					error instanceof Error ? error.message : "Error ejecutando proyecto",
				variant: "destructive",
			});
		} finally {
			setIsRunning(false);
		}
	};

	const currentFile = files.find((f) => f.name === localActiveFile);

	return (
		<div className="min-h-screen bg-background">
			<div className="flex">
				<Sidebar />
				<main className="flex-1 ml-64 pt-16">
					<div className="flex h-[calc(100vh-4rem)]">
						{/* File Explorer */}
						<div className="w-64 border-r border-border bg-card p-4">
							<div className="mb-4">
								<h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
									<FileCode className="w-4 h-4" />
									Archivos
								</h2>
								<div className="space-y-2 mb-3">
									<select
										value={selectedTemplate}
										onChange={(e) => setSelectedTemplate(e.target.value)}
										className="w-full px-2 py-1 text-xs bg-background border border-border rounded">
										{Object.entries(PROJECT_TEMPLATES).map(
											([key, template]) => (
												<option key={key} value={key}>
													{template.icon} {template.name}
												</option>
											)
										)}
									</select>
									<Button
										size="sm"
										variant="outline"
										className="w-full text-xs"
										onClick={handleCreateProject}>
										<Layout className="w-3 h-3 mr-1" />
										Crear Proyecto
									</Button>
								</div>
							</div>
							<FileExplorer
								tree={tree}
								onOpenFile={handleFileSelect}
								onCreateFile={handleCreateFile}
								onCreateFolder={handleCreateFolder}
							/>
						</div>

						{/* Editor Area */}
						<div className="flex-1 flex flex-col">
							<div className="border-b border-border p-4 bg-card">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2">
											<Code2 className="w-5 h-5 text-primary" />
											<span className="font-heading font-semibold">
												Editor de Código
											</span>
										</div>
										<Badge variant="secondary">{localActiveFile}</Badge>
									</div>

									<div className="flex items-center gap-2">
										<Dialog open={configOpen} onOpenChange={setConfigOpen}>
											<DialogTrigger asChild>
												<Button variant="outline" size="sm">
													<Settings2 className="w-4 h-4 mr-2" />
													Configurar
												</Button>
											</DialogTrigger>
											<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
												<DialogHeader>
													<DialogTitle>Configuración y Exportación</DialogTitle>
													<DialogDescription>
														Convierte y exporta tu proyecto a diferentes
														lenguajes y frameworks
													</DialogDescription>
												</DialogHeader>

												<div className="space-y-6 py-4">
													<div className="space-y-4">
														<Label className="text-base font-semibold">
															Exportar proyecto como:
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
															].map((framework) => (
																<Button
																	key={framework.name}
																	variant="outline"
																	className="justify-start h-auto py-3 hover:bg-primary/10 hover:border-primary">
																	<span className="text-2xl mr-3">
																		{framework.icon}
																	</span>
																	<span className="font-medium">
																		{framework.name}
																	</span>
																</Button>
															))}
														</div>
													</div>

													<div className="pt-4 border-t border-border">
														<Label className="text-base font-semibold mb-4 block">
															Opciones de exportación:
														</Label>
														<div className="space-y-4">
															<div className="flex items-center justify-between">
																<div>
																	<p className="font-medium text-sm">
																		Incluir dependencias
																	</p>
																	<p className="text-xs text-muted-foreground">
																		package.json con todas las librerías
																	</p>
																</div>
																<Switch defaultChecked />
															</div>
															<div className="flex items-center justify-between">
																<div>
																	<p className="font-medium text-sm">
																		Minificar código
																	</p>
																	<p className="text-xs text-muted-foreground">
																		Optimizar para producción
																	</p>
																</div>
																<Switch defaultChecked />
															</div>
															<div className="flex items-center justify-between">
																<div>
																	<p className="font-medium text-sm">
																		Comentarios en código
																	</p>
																	<p className="text-xs text-muted-foreground">
																		Documentación automática
																	</p>
																</div>
																<Switch />
															</div>
															<div className="flex items-center justify-between">
																<div>
																	<p className="font-medium text-sm">
																		TypeScript
																	</p>
																	<p className="text-xs text-muted-foreground">
																		Usar TypeScript en lugar de JavaScript
																	</p>
																</div>
																<Switch defaultChecked />
															</div>
														</div>
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

										<Button variant="outline" size="sm" onClick={handleSave}>
											<Save className="w-4 h-4 mr-2" />
											Guardar
										</Button>
										<Button
											size="sm"
											className="bg-primary hover:bg-primary/90"
											onClick={handleRun}>
											<Play className="w-4 h-4 mr-2" />
											Ejecutar
										</Button>
									</div>
								</div>
							</div>

							<Tabs defaultValue="code" className="flex-1">
								<div className="border-b border-border bg-card px-4">
									<TabsList>
										<TabsTrigger value="code">Código</TabsTrigger>
										<TabsTrigger value="preview">Vista Previa</TabsTrigger>
										<TabsTrigger value="console">Consola</TabsTrigger>
									</TabsList>
								</div>

								<TabsContent value="code" className="flex-1 m-0">
									<div className="h-[calc(100vh-13rem)] bg-background p-0">
										<MonacoEditor
											filePath={localActiveFile}
											code={editedContent}
											onChange={setEditedContent}
										/>
									</div>
								</TabsContent>

								<TabsContent value="preview" className="flex-1 m-0">
									<div className="h-[calc(100vh-13rem)] bg-muted/20 p-0">
										{/* Mostrar imagen si el archivo seleccionado es una imagen */}
										{localActiveFile.match(
											/\.(ico|png|jpg|jpeg|gif|svg|webp)$/i
										) ? (
											<div className="flex flex-col items-center justify-center h-full gap-4 p-8">
												<div className="bg-card rounded-lg p-6 shadow-lg">
													<img
														src={(() => {
															// Si ya es una URL data válida, usarla directamente
															if (editedContent.startsWith("data:")) {
																return editedContent;
															}

															// Detectar si el contenido es texto (SVG o base64)
															const isTextContent = editedContent
																.trim()
																.startsWith("<");

															if (
																isTextContent ||
																localActiveFile.endsWith(".svg")
															) {
																// Contenido SVG
																return `data:image/svg+xml;utf8,${encodeURIComponent(
																	editedContent
																)}`;
															} else {
																// Contenido base64 para imágenes binarias
																const extension = localActiveFile
																	.split(".")
																	.pop()
																	?.toLowerCase();
																const mimeType =
																	extension === "ico" ? "x-icon" : extension;
																return `data:image/${mimeType};base64,${editedContent}`;
															}
														})()}
														alt={localActiveFile}
														className="max-w-full max-h-[60vh] object-contain"
														onError={(e) => {
															const target = e.currentTarget;
															target.style.display = "none";
															const errorMsg = document.createElement("div");
															errorMsg.className =
																"text-sm text-destructive text-center p-4";
															errorMsg.textContent =
																"Error al cargar la imagen. Verifica que el archivo tenga un formato válido.";
															target.parentElement?.appendChild(errorMsg);
														}}
													/>
												</div>
												<div className="text-center">
													<p className="text-sm font-medium text-foreground">
														{localActiveFile}
													</p>
													<p className="text-xs text-muted-foreground mt-1">
														{editedContent.trim().startsWith("<")
															? "Imagen SVG"
															: "Archivo binario (base64)"}
													</p>
												</div>
											</div>
										) : (
											// Mostrar iframe para la aplicación
											<iframe
												ref={iframeRef}
												id="preview-iframe"
												style={{
													width: "100%",
													height: "100%",
													border: "none",
												}}
												title="Vista Previa"
											/>
										)}
									</div>
								</TabsContent>

								<TabsContent value="console" className="flex-1 m-0">
									<div className="h-[calc(100vh-13rem)] bg-background p-6">
										<Card className="h-full bg-card border-border p-4 overflow-auto font-mono text-sm">
											<div className="space-y-2 text-muted-foreground">
												{consoleLines.map((line, i) => (
													<p key={i}>{line}</p>
												))}
											</div>
										</Card>
									</div>
								</TabsContent>
							</Tabs>
						</div>

						{/* Properties Panel */}
						<div className="w-80 border-l border-border bg-card p-4">
							<h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
								<Palette className="w-4 h-4" />
								Propiedades
							</h2>
							<div className="space-y-4">
								<Card className="p-4 bg-secondary/50 border-border">
									<h3 className="text-sm font-medium mb-2">
										Componente Seleccionado
									</h3>
									<p className="text-xs text-muted-foreground">Button</p>
								</Card>

								<div className="space-y-3">
									<div>
										<label className="text-xs font-medium block mb-2">
											Color
										</label>
										<div className="flex gap-2">
											<div className="w-8 h-8 rounded-lg bg-primary border-2 border-foreground cursor-pointer" />
											<div className="w-8 h-8 rounded-lg bg-secondary border border-border cursor-pointer" />
											<div className="w-8 h-8 rounded-lg bg-destructive border border-border cursor-pointer" />
										</div>
									</div>

									<div>
										<label className="text-xs font-medium block mb-2">
											Tamaño
										</label>
										<select className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border">
											<option>Default</option>
											<option>Small</option>
											<option>Large</option>
										</select>
									</div>

									<div>
										<label className="text-xs font-medium block mb-2">
											Variante
										</label>
										<select className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border">
											<option>Default</option>
											<option>Outline</option>
											<option>Ghost</option>
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
