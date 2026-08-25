import { generateTypeboxOptions } from "../../annotations/options";
import { getConfig } from "../../config";

export function makeUnion(
  inputModels: string[],
  options = generateTypeboxOptions({ exludeAdditionalProperties: false }),
) {
  return `${getConfig().typeboxImportVariableName}.Union([${inputModels.join(
    ",",
  )}], ${options})\n`;
}
