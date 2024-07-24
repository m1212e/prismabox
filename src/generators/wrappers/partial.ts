import { generateTypeboxOptions } from "../../annotations/options";
import { getConfig } from "../../config";

export function wrapWithPartial(
  input: string,
  exludeAdditionalPropertiesInOptions = false
) {
  return `${
    getConfig().typeboxImportVariableName
  }.Partial(${input}, ${generateTypeboxOptions({ exludeAdditionalProperties: exludeAdditionalPropertiesInOptions })})`;
}
