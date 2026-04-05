import { WebContainer } from '@webcontainer/api';
import { cleanAnsiCodes } from '@/editor/cleanAnsi';

let webcontainer: WebContainer | null = null;

export async function initWebContainer(fsSnapshot: Record<string, string>) {
  console.log("Inicializando WebContainer...");

  try {
    if (!webcontainer) {
      webcontainer = await WebContainer.boot();
    }

    for (const [path, content] of Object.entries(fsSnapshot)) {
      await writeFileToContainer(path, content);
    }

    console.log("Archivos cargados en WebContainer");
  } catch (error) {
    console.error("Error inicializando WebContainer:", error);
    throw error;
  }
}

async function writeFileToContainer(path: string, content: string) {
  if (!webcontainer) return;

  const folders = path.split('/').filter(f => f).slice(0, -1);
  let currentPath = '';

  for (const folder of folders) {
    currentPath += `/${folder}`;
    try {
      await webcontainer.fs.mkdir(currentPath, { recursive: true });
    } catch (_) {
      // Carpeta ya existe
    }
  }

  await webcontainer.fs.writeFile(path, content, 'utf8');
}

export async function installDependencies(onLog: (msg: string) => void): Promise<void> {
  if (!webcontainer) {
    throw new Error("WebContainer no inicializado");
  }

  try {
    onLog("Iniciando instalación de dependencias...");
    onLog("Esto puede tardar varios minutos...");
    
    const installProcess = await webcontainer.spawn("npm", ["install"], {
      env: { NODE_ENV: "development" }
    });

    const outputReader = installProcess.output.getReader();
    
    let buffer = '';
    let packageCount = 0;
    
    try {
      while (true) {
        const { done, value } = await outputReader.read();
        if (done) break;
        
        buffer += value;
        
        // Filtrar spinner y caracteres de animación (corregido)
        const isSpinner = /^[\s\-|/\\]+$/.test(value.trim());
        if (isSpinner) continue;
        
        const cleaned = cleanAnsiCodes(value);
        const trimmed = cleaned.trim();
        
        // Filtrar logs útiles
        if (trimmed.length > 2 && !isSpinner) {
          // Detectar progreso de instalación
          if (trimmed.includes('added') || trimmed.includes('packages')) {
            onLog(`${trimmed}`);
            const match = trimmed.match(/(\d+) packages/);
            if (match) packageCount = parseInt(match[1]);
          }
          else if (trimmed.includes('vulnerabilities')) {
            onLog(`${trimmed}`);
          }
          else if (trimmed.includes('npm WARN')) {
            onLog(`${trimmed.replace('npm WARN', '').trim()}`);
          }
          else if (!trimmed.match(/^[.\s]*$/)) {
            // Solo mostrar si tiene contenido real (corregido)
            onLog(trimmed);
          }
        }
      }
    } finally {
      outputReader.releaseLock();
    }

    const exitCode = await installProcess.exit;
    
    if (exitCode !== 0) {
      throw new Error(`npm install falló con código ${exitCode}`);
    }
    
    if (packageCount > 0) {
      onLog(`${packageCount} paquetes instalados correctamente`);
    } else {
      onLog("Dependencias instaladas correctamente");
    }
  } catch (error) {
    onLog(`Error instalando dependencias: ${error}`);
    throw error;
  }
}

export async function installPackage(
  packageName: string,
  onLog: (msg: string) => void
): Promise<void> {
  if (!webcontainer) throw new Error('WebContainer no inicializado');
  onLog(`Instalando ${packageName}...`);
  const proc = await webcontainer.spawn('npm', ['install', packageName]);
  const reader = proc.output.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const line = cleanAnsiCodes(value).trim();
      if (line.length > 2) onLog(line);
    }
  } finally {
    reader.releaseLock();
  }
  const code = await proc.exit;
  if (code !== 0) throw new Error(`npm install ${packageName} falló (código ${code})`);
  onLog(`${packageName} instalado`);
}

export async function runDevServer(
  onLog: (msg: string) => void,
  onError?: (error: string) => void
): Promise<string> {
  if (!webcontainer) {
    throw new Error("WebContainer no inicializado");
  }

  try {
    onLog("Iniciando servidor de desarrollo...");

    const serverProcess = await webcontainer.spawn("npm", ["run", "dev"], {
      env: {
        NODE_ENV: "development",
        PORT: '3000'
      }
    });

    const outputReader = serverProcess.output.getReader();

    (async () => {
      // Accumulate multi-line error blocks
      let errorBuffer = '';
      let inErrorBlock = false;

      while (true) {
        const { done, value } = await outputReader.read();
        if (done) break;

        const cleaned = cleanAnsiCodes(value);
        const trimmed = cleaned.trim();

        if (trimmed.length > 2 && !trimmed.match(/^[\s\-|/\\]+$/)) {
          if (trimmed.includes('ready') || trimmed.includes('compiled') ||
              trimmed.includes('Local:') || trimmed.includes('localhost')) {
            onLog(`${trimmed}`);
          } else {
            onLog(trimmed);
          }
        }

        // Detect Vite error blocks and forward to onError
        if (onError) {
          if (trimmed.includes('[plugin:vite') || trimmed.includes('error:') || trimmed.startsWith('Error:')) {
            inErrorBlock = true;
            errorBuffer = trimmed;
          } else if (inErrorBlock) {
            if (trimmed.length === 0) {
              // Empty line ends the error block
              if (errorBuffer) onError(errorBuffer);
              errorBuffer = '';
              inErrorBlock = false;
            } else {
              errorBuffer += '\n' + trimmed;
            }
          }
        }
      }
    })();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout esperando servidor"));
      }, 60000);

      webcontainer!.on("server-ready", (port, url) => {
        clearTimeout(timeout);
        onLog(`Servidor listo en: ${url}`);
        resolve(url);
      });

      serverProcess.exit.then((exitCode) => {
        clearTimeout(timeout);
        if (exitCode !== 0) {
          reject(new Error(`Servidor falló con código ${exitCode}`));
        }
      });
    });
  } catch (error) {
    onLog(`Error iniciando servidor: ${error}`);
    throw error;
  }
}

/**
 * Updates files inside an already-running WebContainer without restarting.
 * Vite's HMR picks up the changes automatically.
 */
export async function updateFilesInContainer(files: Record<string, string>): Promise<void> {
  if (!webcontainer) throw new Error('WebContainer no inicializado');
  for (const [path, content] of Object.entries(files)) {
    await writeFileToContainer(path, content);
  }
}

export async function getWebContainer(): Promise<WebContainer | null> {
  return webcontainer;
}

/**
 * Runs `vite build` inside the WebContainer and returns the dist/ files
 * as a flat record { "index.html": "...", "assets/index.js": "..." }.
 */
export async function buildProject(): Promise<Record<string, string>> {
  if (!webcontainer) throw new Error('WebContainer no inicializado');

  const buildProcess = await webcontainer.spawn('npm', ['run', 'build']);

  // Drain output (required to avoid hanging)
  const reader = buildProcess.output.getReader();
  try {
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }

  const exitCode = await buildProcess.exit;
  if (exitCode !== 0) throw new Error('vite build falló');

  // Read dist/ recursively
  const files: Record<string, string> = {};

  async function readDir(dirPath: string) {
    const entries = await webcontainer!.fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry.name}`;
      if (entry.isDirectory()) {
        await readDir(fullPath);
      } else {
        const content = await webcontainer!.fs.readFile(fullPath, 'utf-8');
        // Store relative to dist/ e.g. "assets/index-abc.js"
        files[fullPath.replace(/^\/dist\//, '')] = content;
      }
    }
  }

  await readDir('/dist');
  return files;
}
