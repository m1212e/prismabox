import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";

export function Enum(
  data: Pick<DMMF.DatamodelEnum, "values">,
  options?: string
) {
  const variantsString = data.values
    .map((v) => `${typeboxImportVariableName}.Literal('${v.name}')`)
    .join(",");

  return `${typeboxImportVariableName}.Union([${variantsString}]${
    options ? "," + options : ""
  });`;
}
