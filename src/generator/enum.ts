import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import { Annotation, parseDocumentation } from "./documentation";

export function Enum(
  data: Pick<DMMF.DatamodelEnum, "values" | "documentation">
) {
  const modelDoc = parseDocumentation(data.documentation);
  if (modelDoc.annotations.includes(Annotation.HIDDEN)) return undefined;

  const variantsString = data.values
    .map((v) => `${typeboxImportVariableName}.Literal('${v.name}')`)
    .join(",");

  return `${typeboxImportVariableName}.Union([${variantsString}],${modelDoc.options})\n`;
}
