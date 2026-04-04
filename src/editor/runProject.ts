import { dumpFsToJson } from "@/editor/fileSystem/lightningFsAdapter";
import { initWebContainer, installDependencies, runDevServer } from "@/editor/runtime/orionContainer";

export async function runProject(
  onLog?: (message: string) => void
): Promise<string | null> {
  const log = onLog || console.log;
  
  try {
    log("Obteniendo snapshot del filesystem...");
    const snapshot = await dumpFsToJson();
    
    log("Inicializando WebContainer...");
    await initWebContainer(snapshot);
    
    log("Instalando dependencias...");
    await installDependencies(log);
    
    log("Iniciando servidor de desarrollo...");
    const serverUrl = await runDevServer(log);
    
    log(`Servidor listo en: ${serverUrl}`);
    return serverUrl;
    
  } catch (error) {
    log(`Error ejecutando proyecto: ${error}`);
    throw error;
  }
}