import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import { Annotation, parseDocumentation } from "./documentation";
import type { Models } from "../util/modelMap";
import { NullableVariant, isPrimitivePrismaFieldType } from "./plainModel";

export function RelationModel(
  data: Pick<DMMF.Model, "fields" | "documentation">,
  referenceableModels: Models
) {
  const modelDoc = parseDocumentation(data.documentation);
  if (modelDoc.annotations.includes(Annotation.HIDDEN)) return undefined;

  const fields = data.fields
    .map((field) => {
      if (isPrimitivePrismaFieldType(field.type)) return undefined;
      const doc = parseDocumentation(field.documentation);
      if (doc.annotations.includes(Annotation.HIDDEN)) return undefined;

      return RelationField({
        name: field.name,
        fieldType: field.type,
        list: field.isList,
        optional: field.isRequired
          ? NullableVariant.REQUIRED
          : NullableVariant.NULLABLE,
        options: doc.options,
        referenceableModels,
      });
    })
    .filter((x) => x) as string[];

  return `${typeboxImportVariableName}.Object({${fields.join(",")}},${modelDoc.options})\n`;
}

export function RelationField({
  name,
  fieldType,
  options,
  optional,
  list,
  referenceableModels,
}: {
  fieldType: string;
  options: string;
  name: string;
  optional: NullableVariant;
  list: boolean;
  referenceableModels: Models;
}) {
  if (options.length > 0) {
    console.warn(
      `Options are not supported for relation fields. Ignoring options for field: ${name} (${options})`
    );
  }

  let ret = `${name}: `;

  if (optional === NullableVariant.NULLABLE) {
    ret += "Nullable(";
  } else if (optional === NullableVariant.OPTIONAL) {
    ret += `${typeboxImportVariableName}.Optional(`;
  }

  if (list) {
    ret += `${typeboxImportVariableName}.Array(`;
  }

  const referencedFieldModel = referenceableModels.get(fieldType);
  if (!referencedFieldModel) {
    console.warn(
      `Could not find model for field type: ${fieldType}. It may annotated as hidden. Ignoring field: ${name} (${fieldType})`
    );
    return undefined;
  }
  ret += referencedFieldModel;

  if (
    optional === NullableVariant.NULLABLE ||
    optional === NullableVariant.OPTIONAL
  ) {
    ret += ")";
  }

  if (list) {
    ret += ")";
  }

  return ret;
}
