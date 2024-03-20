import type { Models } from "../util/modelMap";
import { TypeboxImportStatement } from "./typeboxImport";

export function Compose(models: Models) {
  let ret = `${TypeboxImportStatement()}\n`;

  for (const [modelName, modelString] of models) {
    ret += `export const ${modelName} = ${modelString}\n`;
  }

  return ret;
}
