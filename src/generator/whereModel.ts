import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import { Annotation, parseDocumentation } from "./documentation";
import { PlainModel } from "./plainModel";

export function WhereModel(
  data: Pick<DMMF.Model, "fields" | "documentation" | "name" | "uniqueFields">
) {
  const modelDoc = parseDocumentation(data.documentation);
  if (modelDoc.annotations.includes(Annotation.HIDDEN)) return undefined;

  const plainUniqueFieldNames = data.fields
    .map((field) => {
      const doc = parseDocumentation(field.documentation);
      if (doc.annotations.includes(Annotation.HIDDEN)) return undefined;
      if (!field.isId && !field.isUnique) return undefined;

      return field.name;
    })
    .filter((x) => x) as string[];

  const uniqueIndexFieldNames = data.uniqueFields
    .map((uniqueFieldFields) => {
      return `${uniqueFieldFields.join("_")}`;
    })
    .filter((x) => x) as string[];

  const uniqueIndexFields = data.uniqueFields
    .map((uniqueFieldFields) => {
      const fields = data.fields.filter((field) =>
        uniqueFieldFields.includes(field.name)
      );
      return `${uniqueFieldFields.join("_")}: ${PlainModel({ fields })}`;
    })
    .filter((x) => x) as string[];

  const baseType = `${typeboxImportVariableName}.Composite([${typeboxImportVariableName}.Object({${uniqueIndexFields.join(",")}}),${typeboxImportVariableName}.Pick(${data.name}Plain, [${plainUniqueFieldNames.map((f) => `"${f}"`).join(",")}])])`;

  return `${typeboxImportVariableName}.Union([${[...plainUniqueFieldNames, ...uniqueIndexFieldNames].map((fieldname) => `${typeboxImportVariableName}.Composite([${typeboxImportVariableName}.Pick(${typeboxImportVariableName}.Required(${baseType}), ["${fieldname}"]),${typeboxImportVariableName}.Omit(${typeboxImportVariableName}.Partial(${baseType}), ["${fieldname}"])])`).join(",")}])\n`;
}
