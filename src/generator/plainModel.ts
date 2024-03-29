import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import { Annotation, parseDocumentation } from "./documentation";
import { NullableVariant, nullableVariableName } from "./nullable";

/**
 * @param allowUndefinedFields In case we want to create input schemes, we want to allow fields to be undefined (just not set) if they are optional
 */
export function PlainModel(
  data: Pick<DMMF.Model, "fields" | "documentation">,
  allowUndefinedFields = false
) {
  const modelDoc = parseDocumentation(data.documentation);

  if (modelDoc.annotations.includes(Annotation.HIDDEN)) return undefined;

  const fields = data.fields
    .map((field) => {
      if (!isPrimitivePrismaFieldType(field.type)) return undefined;
      const doc = parseDocumentation(field.documentation);
      if (doc.annotations.includes(Annotation.HIDDEN)) return undefined;

      return PrimitiveField({
        name: field.name,
        fieldType: field.type,
        list: field.isList,
        optional: field.isRequired
          ? NullableVariant.REQUIRED
          : allowUndefinedFields
            ? NullableVariant.OPTIONAL_NULLABLE
            : NullableVariant.NULLABLE,
        options: doc.options,
      });
    })
    .filter((x) => x) as string[];

  return `${typeboxImportVariableName}.Object({${fields.join(",")}},${modelDoc.options})\n`;
}

type PrimitivePrismaFieldType =
  | "Int"
  | "Float"
  | "Decimal"
  | "BigInt"
  | "String"
  | "DateTime"
  | "Json"
  | "Date"
  | "Boolean";

export function isPrimitivePrismaFieldType(
  str: string
): str is PrimitivePrismaFieldType {
  return [
    "Int",
    "BigInt",
    "Float",
    "Decimal",
    "String",
    "DateTime",
    "Date",
    "Json",
    "Boolean",
  ].includes(str);
}

export function PrimitiveField({
  name,
  fieldType,
  options,
  optional,
  list,
}: {
  fieldType: PrimitivePrismaFieldType;
  options: string;
  name: string;
  optional: NullableVariant;
  list: boolean;
}) {
  let ret = `${name}: `;

  if (optional === NullableVariant.NULLABLE) {
    ret += `${nullableVariableName}(`;
  } else if (optional === NullableVariant.OPTIONAL) {
    ret += `${typeboxImportVariableName}.Optional(`;
  } else if (optional === NullableVariant.OPTIONAL_NULLABLE) {
    ret += `${typeboxImportVariableName}.Optional(${nullableVariableName}(`;
  }

  if (list) {
    ret += `${typeboxImportVariableName}.Array(`;
  }

  if (["Int", "BigInt"].includes(fieldType)) {
    ret += `${typeboxImportVariableName}.Integer(${options})`;
  } else if (["Float", "Decimal"].includes(fieldType)) {
    ret += `${typeboxImportVariableName}.Number(${options})`;
  } else if (fieldType === "String") {
    ret += `${typeboxImportVariableName}.String(${options})`;
  } else if (["DateTime", "Date"].includes(fieldType)) {
    ret += `${typeboxImportVariableName}.Date(${options})`;
  } else if (fieldType === "Json") {
    ret += `${typeboxImportVariableName}.Any(${options})`;
  } else if (fieldType === "Boolean") {
    ret += `${typeboxImportVariableName}.Boolean(${options})`;
  } else throw new Error("Invalid type for primitive generation");

  if (
    optional === NullableVariant.NULLABLE ||
    optional === NullableVariant.OPTIONAL
  ) {
    ret += ")";
  } else if (optional === NullableVariant.OPTIONAL_NULLABLE) {
    ret += "))";
  }

  if (list) {
    ret += ")";
  }

  return ret;
}
