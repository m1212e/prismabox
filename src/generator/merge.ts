import type { Models } from "../util/modelMap";
import { typeboxImportVariableName } from "./typeboxImport";

export function Composite(models: Models) {
  const modelList = Array.from(models.entries())
    .map(([name, _content]) => name)
    .join(", ");

  return `${typeboxImportVariableName}.Composite([${modelList}])`;
}
