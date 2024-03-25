import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import { Annotation, parseDocumentation } from "./documentation";
import {
  NullableVariant,
  PrimitiveField,
  isPrimitivePrismaFieldType,
} from "./plainModel";
import type { Models } from "../util/modelMap";
import { RelationField } from "./relationModel";

let enabled = false;
export function enableDataModel() {
  enabled = true;
}

export function DataModel(
  data: Pick<DMMF.Model, "fields" | "documentation">,
  referenceableEnums: Models
) {
  return internal(data, referenceableEnums, false);
}

export function DataModelOptional(
  data: Pick<DMMF.Model, "fields" | "documentation">,
  referenceableEnums: Models
) {
  return internal(data, referenceableEnums, true);
}

function internal(
  data: Pick<DMMF.Model, "fields" | "documentation">,
  referenceableEnums: Models,
  optional: boolean
) {
  if (!enabled) return undefined;
  const modelDoc = parseDocumentation(data.documentation);
  if (
    modelDoc.annotations.includes(Annotation.HIDDEN) ||
    modelDoc.annotations.includes(Annotation.HIDDEN_DATA)
  )
    return undefined;

  const fields = data.fields
    .map((field) => {
      const doc = parseDocumentation(field.documentation);
      if (
        doc.annotations.includes(Annotation.HIDDEN) ||
        doc.annotations.includes(Annotation.HIDDEN_DATA)
      ) {
        return undefined;
      }

      const isEnumField = referenceableEnums.has(field.type);

      if (!isEnumField && !isPrimitivePrismaFieldType(field.type))
        return undefined;

      if (isEnumField) {
        return RelationField({
          fieldType: field.type,
          list: field.isList,
          name: field.name,
          optional: field.isRequired
            ? optional
              ? NullableVariant.OPTIONAL
              : NullableVariant.REQUIRED
            : NullableVariant.NULLABLE,
          options: doc.options,
          referenceableModels: referenceableEnums,
        });
      }

      // is the field a foreign key id field?
      if (
        field.name.toLocaleLowerCase().endsWith("id") &&
        data.fields.find(
          (f) =>
            f.name.toLowerCase() ===
            field.name.toLowerCase().substring(0, field.name.length - 2)
        )
      ) {
        return undefined;
      }

      if (field.isId) {
        return undefined;
      }

      if (
        field.hasDefaultValue &&
        field.name === "createdAt" &&
        field.type === "DateTime"
      ) {
        return undefined;
      }

      return PrimitiveField({
        fieldType: field.type as any, // we checked earlier if it's a primitive type
        list: field.isList,
        name: field.name,
        optional: field.isRequired
            ? optional
              ? NullableVariant.OPTIONAL
              : NullableVariant.REQUIRED
            : NullableVariant.NULLABLE,
        options: parseDocumentation(field.documentation).options,
      });
    })
    .filter((f) => f) as string[];

  return `${typeboxImportVariableName}.Object({${fields.join(",")}},${modelDoc.options})\n`;
}
