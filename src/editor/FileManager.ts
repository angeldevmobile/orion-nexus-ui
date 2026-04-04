import { fs } from "./fileSystem/lightningFsAdapter";

export class FileManager {
  async readFile(path: string): Promise<string> {
    return fs.readFile(path, "utf8");
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (typeof content !== 'string') {
      console.warn(`Invalid content type for ${path}, converting to string`);
      content = String(content || '');
    }

    // Asegurar que el directorio padre existe
    const dir = path.split('/').slice(0, -1).join('/');
    if (dir && dir !== '') {
      await this.createFolder(dir);
    }
    
    // Detectar si es un archivo binario en base64
    if (this.isBinaryContent(content, path)) {
      await this.writeBinaryFile(path, content);
    } else {
      await fs.writeFile(path, content, "utf8");
    }
  }

  // Detectar archivos binarios por extensión o contenido
  private isBinaryContent(content: string, path: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    const binaryExtensions = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.woff', '.woff2', '.ttf', '.eot'];
    const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
    
    // Si es extensión binaria o empieza con data: URL
    return binaryExtensions.includes(ext) || content.startsWith('data:');
  }

  // Escribir archivo binario desde base64
  private async writeBinaryFile(path: string, content: string): Promise<void> {
    try {
      let base64Data = content;
      
      // Extraer base64 de data URL si es necesario
      if (content.startsWith('data:')) {
        const matches = content.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches[2]) {
          base64Data = matches[2];
        }
      }
      
      // Convertir base64 a Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Escribir como binario
      await (fs.writeFile as (path: string, data: Uint8Array | string, encoding?: string) => Promise<void>)(path, bytes);
      console.log(`Binary file written: ${path}`);
    } catch (error) {
      console.error(`Error escribiendo archivo binario ${path}:`, error);
      throw error;
    }
  }

  async createFile(path: string): Promise<void> {
    await this.writeFile(path, "");
  }

  async createFolder(path: string): Promise<void> {
    const parts = path.split('/').filter(p => p !== '');
    let current = '';
    for (const part of parts) {
      current += `/${part}`;
      try {
        await fs.mkdir(current);
        console.log(`Folder created: ${current}`);
      } catch {
        // Ignore — already exists
      }
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await fs.unlink(path);
    } catch (error) {
      console.warn(`No se pudo eliminar el archivo ${path}:`, error);
    }
  }

  async deleteFolder(path: string): Promise<void> {
    try {
      await fs.rmdir(path);
    } catch (error) {
      console.warn(`No se pudo eliminar la carpeta ${path}:`, error);
    }
  }

  async clearDirectory(path: string): Promise<void> {
    try {
      const items = await this.listDir(path);

      for (const item of items) {
        const itemPath = item.path;

        if (item.type === "folder") {
          await this.clearDirectory(itemPath);
          await this.deleteFolder(itemPath);
        } else {
          await this.deleteFile(itemPath);
        }
      }
    } catch (error) {
      console.warn(`No se pudo limpiar el directorio ${path}:`, error);
    }
  }

  async listDir(path: string) {
    try {
      const names = await fs.readdir(path);
      const result = [];

      for (const name of names) {
        const fullPath = path === "/" ? `/${name}` : `${path}/${name}`;
        const stat = await fs.stat(fullPath);

        result.push({
          name,
          path: fullPath,
          type: stat.type === "dir" ? "folder" : "file",
        });
      }
      return result;
    } catch (error) {
      console.warn(`Error listando directorio ${path}:`, error);
      return [];
    }
  }
}

export const fileManager = new FileManager();
