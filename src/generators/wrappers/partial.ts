import { generateTypeboxOptions } from "../../annotations/options";
import { getConfig } from "../../config";

export function wrapWithPartial(input: string) {
  return `${
    getConfig().typeboxImportVariableName
  }.Partial(${input}, ${generateTypeboxOptions()})`;
}
