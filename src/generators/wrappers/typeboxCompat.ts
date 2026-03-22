import { getConfig } from "../../config";

export const TYPEBOX_DATE_NAME = "__typeboxDate__";
export const TYPEBOX_UINT8_ARRAY_NAME = "__typeboxUint8Array__";

export function typeboxCompatImportStatement() {
  const { typeboxImportDependencyName, importFileExtension } = getConfig();

  if (typeboxImportDependencyName !== "typebox") {
    return "";
  }

  return `import { ${TYPEBOX_DATE_NAME} } from "./${TYPEBOX_DATE_NAME}${importFileExtension}"\nimport { ${TYPEBOX_UINT8_ARRAY_NAME} } from "./${TYPEBOX_UINT8_ARRAY_NAME}${importFileExtension}"\n`;
}

export function typeboxDateType() {
  const { typeboxImportDependencyName, typeboxImportVariableName } =
    getConfig();
  if (typeboxImportDependencyName !== "typebox") {
    return "";
  }

  return `import ${
    typeboxImportVariableName
  } from "${typeboxImportDependencyName}"
export function ${TYPEBOX_DATE_NAME}(options?: Record<string, unknown>) {
  return ${typeboxImportVariableName}.Refine(
    ${typeboxImportVariableName}.Unsafe<globalThis.Date>({ ...(options ?? {}) }),
    (value) => value instanceof globalThis.Date,
    "must be Date",
  )
}\n`;
}

export function typeboxUint8ArrayType() {
  const { typeboxImportDependencyName, typeboxImportVariableName } =
    getConfig();
  if (typeboxImportDependencyName !== "typebox") {
    return "";
  }

  return `import ${
    typeboxImportVariableName
  } from "${typeboxImportDependencyName}"
export function ${TYPEBOX_UINT8_ARRAY_NAME}(options?: Record<string, unknown>) {
  return ${typeboxImportVariableName}.Refine(
    ${typeboxImportVariableName}.Unsafe<globalThis.Uint8Array>({
      ...(options ?? {}),
    }),
    (value) => value instanceof globalThis.Uint8Array,
    "must be Uint8Array",
  )
}\n`;
}
