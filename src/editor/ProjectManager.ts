import { fileManager } from './FileManager';
import { getTemplate, PROJECT_TEMPLATES } from './templates';
import { runProject } from './runProject';
import { buildFsTree } from './fileSystem/lightningFsAdapter';

export class ProjectManager {
  /**
   * Crea un nuevo proyecto desde un template y lo ejecuta automáticamente
   */
  static async createAndRunProject(
    templateId: string,
    onLog?: (message: string) => void
  ): Promise<string | null> {
    const log = onLog || console.log;

    try {
      log(`🎯 Creando proyecto con template: ${templateId}`);
      
      const template = getTemplate(templateId);
      if (!template) {
        throw new Error(`Template '${templateId}' no encontrado`);
      }

      log("🧹 Limpiando workspace...");
      await this.clearWorkspace();

      log(`📁 Creando archivos para: ${template.name}`);
      const files = await template.createProject();
      
      await this.writeFilesToFs(files, log);

      log("🚀 Ejecutando proyecto...");
      const serverUrl = await runProject(log);

      log(`✅ Proyecto '${template.name}' creado y ejecutándose`);
      return serverUrl;

    } catch (error) {
      log(`❌ Error creando proyecto: ${error}`);
      throw error;
    }
  }

  /**
   * Carga un template sin ejecutarlo
   */
  static async loadTemplate(
    templateId: string,
    onLog?: (message: string) => void
  ): Promise<void> {
    const log = onLog || console.log;

    try {
      const template = getTemplate(templateId);
      if (!template) {
        throw new Error(`Template '${templateId}' no encontrado`);
      }

      log("🧹 Limpiando workspace...");
      await this.clearWorkspace();

      log(`📁 Cargando template: ${template.name}`);
      const files = await template.createProject();
      
      await this.writeFilesToFs(files, log);
      
      log(`✅ Template '${template.name}' cargado`);
    } catch (error) {
      log(`❌ Error cargando template: ${error}`);
      throw error;
    }
  }

  private static async clearWorkspace(): Promise<void> {
    try {
      await fileManager.clearDirectory('/');
      await fileManager.createFolder('/src');
      await fileManager.createFolder('/public');
    } catch (error) {
      console.warn("Error limpiando workspace:", error);
    }
  }

  private static async writeFilesToFs(
    files: Record<string, string>,
    log: (message: string) => void
  ): Promise<void> {
    const fileCount = Object.keys(files).length;
    log(`📝 Escribiendo ${fileCount} archivos...`);

    for (const [path, content] of Object.entries(files)) {
      try {
        await fileManager.writeFile(path, content);
        log(`   ✓ ${path}`);
      } catch (error) {
        log(`   ❌ Error escribiendo ${path}: ${error}`);
        throw error;
      }
    }
  }

  static getAvailableTemplates() {
    return Object.entries(PROJECT_TEMPLATES).map(([id, template]) => ({
      id,
      ...template,
    }));
  }
}