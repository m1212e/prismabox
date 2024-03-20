import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import { Annotation, parseDocumentation } from "./documentation";
import type { Models } from "../util/modelMap";
import { isPrimitivePrismaFieldType } from "./plainModel";

export function RelationModel(
  data: Pick<DMMF.Model, "fields">,
  referenceablePlainModels: Models,
  options?: string
) {
  const fields = data.fields
    .map((field) => {
      if (isPrimitivePrismaFieldType(field.type)) return undefined;
      const doc = parseDocumentation(field.documentation);
      if (doc.annotations.includes(Annotation.HIDDEN)) return undefined;

      return RelationField({
        name: field.name,
        fieldType: field.type,
        list: field.isList,
        optional: !field.isRequired,
        options: doc.options,
        referenceablePlainModels,
      });
    })
    .filter((x) => x) as string[];

  return `${typeboxImportVariableName}.Object({${fields.join(",")}}${
    options ? "," + options : ""
  })\n`;
}

function RelationField({
  name,
  fieldType,
  options,
  optional,
  list,
  referenceablePlainModels,
}: {
  fieldType: string;
  options: string;
  name: string;
  optional: boolean;
  list: boolean;
  referenceablePlainModels: Models;
}) {
  if (options.length > 0) {
    console.warn(
      `Options are not supported for relation fields. Ignoring options for field: ${name} (${options})`
    );
  }

  let ret = `${name}: `;

  if (optional) {
    ret += `${typeboxImportVariableName}.Optional(`;
  }

  if (list) {
    ret += `${typeboxImportVariableName}.Array(`;
  }

  const referencedFieldModel = referenceablePlainModels.get(fieldType);
  if (!referencedFieldModel) {
    console.warn(`Could not find model for field type: ${fieldType}`);
    return undefined;
  }
  ret += referencedFieldModel;

  if (optional) {
    ret += ")";
  }

  if (list) {
    ret += ")";
  }

  return ret;
}
