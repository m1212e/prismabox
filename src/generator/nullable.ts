import {
  typeboxImportDependencyName,
  typeboxImportVariableName,
} from "./typeboxImport";

export enum NullableVariant {
  NULLABLE = 0, // null or the value
  OPTIONAL = 1, // undefined or the value
  REQUIRED = 2, // the value
  OPTIONAL_NULLABLE = 3, // null, undefined or the value
}

export const nullableVariableName = "_Nullable";

export function NullableType() {
  return `import { ${typeboxImportVariableName}, type TSchema } from "${typeboxImportDependencyName}"
export const ${nullableVariableName} = <T extends TSchema>(schema: T) => ${typeboxImportVariableName}.Union([${typeboxImportVariableName}.Null(), schema])\n`;
}

export function NullableImport() {
  return `import { ${nullableVariableName} } from "./__nullable__"\n`;
}
