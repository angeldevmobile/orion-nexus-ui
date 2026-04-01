import { fs } from "@/editor/fileSystem/lightningFsAdapter";

export async function dumpFsToJson() {
async function readDir(path: string): Promise<Record<string, string>> {
const result: Record<string, string> = {};
const entries = await fs.readdir(path);


for (const e of entries) {
  const fullPath = `${path}/${e}`;
  const stat = await fs.stat(fullPath);

  if (stat.type === "dir") {
    Object.assign(result, await readDir(fullPath));
  } else {
    const data = await fs.readFile(fullPath, "utf8");
    result[fullPath] = data;
  }
}

return result;

}

return readDir("/");
}
