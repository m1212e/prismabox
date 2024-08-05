import { getConfig } from "./config";

export function generateBarrelFile(imports: string[]) {
  return imports.map((i) => `export * from "./${i}${getConfig().importFileExtension}";`).join("\n");
}
