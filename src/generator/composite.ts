import type { Models } from "../util/modelMap";
import { parseDocumentation } from "./documentation";
import { typeboxImportVariableName } from "./typeboxImport";

export function Composite(models: Models) {
  const modelList = Array.from(models.entries())
    .map(([name, _content]) => name)
    .join(", ");

  const modelDoc = parseDocumentation(`Composition of ${modelList}`);

  return `${typeboxImportVariableName}.Composite([${modelList}], ${modelDoc.options})\n`;
}
