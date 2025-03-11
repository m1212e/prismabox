import { getConfig } from "../config";

const PrimitiveFields = [
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "String",
  "DateTime",
  "Json",
  "Boolean",
  "Bytes",
] as const;

export type PrimitivePrismaFieldType = (typeof PrimitiveFields)[number];

export function isPrimitivePrismaFieldType(
  str: string,
): str is PrimitivePrismaFieldType {
  // biome-ignore lint/suspicious/noExplicitAny: we want to check if the string is a valid primitive field
  return PrimitiveFields.includes(str as any);
}

export function stringifyPrimitiveType({
  fieldType,
  options,
}: {
  fieldType: PrimitivePrismaFieldType;
  options: string;
}) {
  // Remove `additionalProperties` from options for primitives
  let optionsObject = JSON.parse(options)
  delete optionsObject.additionalProperties
  options = JSON.stringify(optionsObject)

  if (["Int", "BigInt"].includes(fieldType)) {
    return `${getConfig().typeboxImportVariableName}.Integer(${options})`;
  }

  if (["Float", "Decimal"].includes(fieldType)) {
    return `${getConfig().typeboxImportVariableName}.Number(${options})`;
  }

  if (fieldType === "String") {
    return `${getConfig().typeboxImportVariableName}.String(${options})`;
  }

  if (["DateTime"].includes(fieldType)) {
    const config = getConfig();
    if (config.useJsonTypes === "transformer") {
      return `${getConfig().transformDateName}(${options})`;
    }

    if (config.useJsonTypes) {
      let opts = options;
      if (opts.includes("{") && opts.includes("}")) {
        opts = opts.replace("{", "{ format: 'date-time', ");
      } else {
        opts = `{ format: 'date-time' }`;
      }
      return `${config.typeboxImportVariableName}.String(${opts})`;
    }

    return `${getConfig().typeboxImportVariableName}.Date(${options})`;
  }

  if (fieldType === "Json") {
    return `${getConfig().typeboxImportVariableName}.Any(${options})`;
  }

  if (fieldType === "Boolean") {
    return `${getConfig().typeboxImportVariableName}.Boolean(${options})`;
  }

  if (fieldType === "Bytes") {
    return `${getConfig().typeboxImportVariableName}.Uint8Array(${options})`;
  }

  throw new Error("Invalid type for primitive generation");
}
