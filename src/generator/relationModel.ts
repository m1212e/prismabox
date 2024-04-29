import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import { Annotation, parseDocumentation } from "./documentation";
import type { Models } from "../util/modelMap";
import { isPrimitivePrismaFieldType } from "./plainModel";
import { NullableVariant, nullableVariableName } from "./nullable";

export function RelationModel(
  data: Pick<DMMF.Model, "fields" | "documentation">,
	referenceableEnums: Models,
  referenceableModels: Models,
	additionalFields: DMMF.Model["fields"][number][] = [],
) {
  const modelDoc = parseDocumentation(data.documentation);
  if (modelDoc.annotations.includes(Annotation.HIDDEN)) return undefined;

  const fields = data.fields.concat(additionalFields)
    .map((field) => {
      if (isPrimitivePrismaFieldType(field.type) || referenceableEnums.has(field.type)) return undefined;
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
    ret += `${nullableVariableName}(`;
  } else if (optional === NullableVariant.OPTIONAL) {
    ret += `${typeboxImportVariableName}.Optional(`;
  } else if (optional === NullableVariant.OPTIONAL_NULLABLE) {
    ret += `${typeboxImportVariableName}.Optional(${nullableVariableName}(`;
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
  } else if (optional === NullableVariant.OPTIONAL_NULLABLE) {
    ret += "))";
  }

  if (list) {
    ret += ")";
  }

  return ret;
}
