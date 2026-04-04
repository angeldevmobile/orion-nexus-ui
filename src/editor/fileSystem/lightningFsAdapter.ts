import FS from "@isomorphic-git/lightning-fs";

export const lightningFs = new FS("orionFs", { wipe: false });

export interface LightningFsPromises {
  readFile(path: string, encoding?: string): Promise<string>;
  writeFile(path: string, data: string, encoding?: string): Promise<void>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<{ type: "file" | "dir" }>;
  unlink(path: string): Promise<void>;
  rmdir(path: string): Promise<void>;
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
}

export const fs = lightningFs.promises as unknown as LightningFsPromises;

// Helpers - CORREGIR ENCODING
async function ensureFile(path: string, content: string) {
  try {
    await fs.readFile(path, "utf8"); // Cambio aquí: utf8
  } catch {
    const dir = path.split('/').slice(0, -1).join('/');
    if (dir) {
      await ensureDir(dir);
    }
    await fs.writeFile(path, content, "utf8"); // Cambio aquí: utf8
  }
}

async function ensureDir(path: string) {
  if (!path || path === '/') return;
  
  try {
    await fs.readdir(path);
  } catch {
    await fs.mkdir(path, { recursive: true });
  }
}

export async function buildFsTree(path: string = "/"): Promise<FileNode[]> {
  try {
    const entries = await fs.readdir(path);
    const nodes: FileNode[] = [];

    for (const entry of entries) {
      const fullPath = path === "/" ? `/${entry}` : `${path}/${entry}`;
      const stat = await fs.stat(fullPath);

      if (stat.type === "dir") {
        nodes.push({
          name: entry,
          path: fullPath,
          type: "folder",
          children: await buildFsTree(fullPath),
        });
      } else {
        nodes.push({
          name: entry,
          path: fullPath,
          type: "file",
        });
      }
    }

    return nodes;
  } catch (error) {
    console.warn(`Error building tree for ${path}:`, error);
    return [];
  }
}

export async function dumpFsToJson(): Promise<Record<string, string>> {
  async function readDir(path: string): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    try {
      const entries = await fs.readdir(path);

      for (const entry of entries) {
        const fullPath = path === "/" ? `/${entry}` : `${path}/${entry}`;
        const stat = await fs.stat(fullPath);

        if (stat.type === "dir") {
          Object.assign(result, await readDir(fullPath));
        } else {
          const data = await fs.readFile(fullPath, "utf8"); // Cambio aquí: utf8
          result[fullPath] = data;
        }
      }
    } catch (error) {
      console.warn(`Error reading directory ${path}:`, error);
    }

    return result;
  }

  return readDir("/");
}

// Inicialización básica - sin crear archivos automáticamente
export async function initFsStructure() {
  try {
    console.log("Filesystem inicializado (sin archivos por defecto)");
  } catch (error) {
    console.error("Error inicializando filesystem:", error);
  }
}