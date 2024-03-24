import {
  typeboxImportDependencyName,
  typeboxImportVariableName,
} from "./typeboxImport";

export const nullableVariableName = "Nullable";

export function Nullable() {
  return `import { ${typeboxImportVariableName}, type TSchema } from "${typeboxImportDependencyName}"
export const ${nullableVariableName} = <T extends TSchema>(schema: T) => ${typeboxImportVariableName}.Union([${typeboxImportVariableName}.Null(), ${typeboxImportVariableName}.Undefined(), schema])\n`;
}

export function NullableImport() {
  return `import { ${nullableVariableName} } from "./__nullable__"\n`;
}
