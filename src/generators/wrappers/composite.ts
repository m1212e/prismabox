import { generateTypeboxOptions } from "../../annotations/options";
import { getConfig } from "../../config";

export function makeComposite(inputModels: string[]) {
  const {
    typeboxImportDependencyName,
    typeboxImportVariableName,
    exportedTypePrefix,
  } = getConfig();

  if (typeboxImportDependencyName === "typebox") {
    return `${typeboxImportVariableName}.Evaluate(${typeboxImportVariableName}.Intersect([${inputModels
      .map((i) => `${exportedTypePrefix}${i}`)
      .join(",")}], ${generateTypeboxOptions()}))\n`;
  }

  return `${getConfig().typeboxImportVariableName}.Composite([${inputModels
    .map((i) => `${getConfig().exportedTypePrefix}${i}`)
    .join(",")}], ${generateTypeboxOptions()})\n`;
}
