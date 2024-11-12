import { generateTypeboxOptions } from "../../annotations/options";
import { getConfig } from "../../config";

export function makeComposite(inputModels: string[]) {
  return `${
    getConfig().typeboxImportVariableName
  }.Composite([${inputModels.map((i) => `${getConfig().exportedTypePrefix}${i}`).join(",")}], ${generateTypeboxOptions()})\n`;
}
