import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations } from "../annotations/annotations";
import { generateTypeboxOptions } from "../annotations/options";
import { getConfig } from "../config";
import type { ProcessedModel } from "../model";
import { processedEnums } from "./enum";
import { processedPlain } from "./plain";
import { processedPlainSelect } from "./plainInputSelect";
import {
  isPrimitivePrismaFieldType,
  stringifyPrimitiveType,
} from "./primitiveField";
import { wrapWithArray } from "./wrappers/array";
import { wrapWithNullable } from "./wrappers/nullable";
import { wrapWithSelect } from "./wrappers/select";
import { wrapWithOptional } from "./wrappers/optional";
import { processedPlainOrderBy } from "./plainInputOrderBy";

export const processedRelations: ProcessedModel[] = [];

type StringifyRelationsOption = {
  isInputSelect?: boolean;
  isInputInclude?: boolean;
  isInputOrderBy?: boolean;
};

export function processRelations(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyRelations(m);
    if (o) {
      processedRelations.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedRelations);
}

export function stringifyRelations(
  data: DMMF.Model,
  opt?: StringifyRelationsOption
) {
  const annotations = extractAnnotations(data.documentation);

  const stringifyBoolean = stringifyPrimitiveType({
    fieldType: "Boolean",
    options: generateTypeboxOptions({ input: annotations }),
  });

  if (annotations.isHidden) return undefined;

  const fields = data.fields
    .map((field) => {
      const annotations = extractAnnotations(field.documentation);

      if (
        annotations.isHidden ||
        isPrimitivePrismaFieldType(field.type) ||
        processedEnums.find((e) => e.name === field.type)
      ) {
        return undefined;
      }

      let stringifiedType = (
        opt?.isInputSelect
          ? processedPlainSelect
          : opt?.isInputOrderBy
            ? processedPlainOrderBy
            : processedPlain
      ).find((e) => e.name === field.type)?.stringRepresentation;

      if (!stringifiedType) {
        return undefined;
      }

      if (opt?.isInputInclude) {
        stringifiedType = wrapWithOptional(stringifyBoolean);
      } else if (opt?.isInputSelect) {
        stringifiedType = wrapWithOptional(wrapWithSelect(stringifiedType));
      } else if (opt?.isInputOrderBy) {
        stringifiedType = wrapWithOptional(stringifiedType);
      } else {
        if (field.isList) {
          stringifiedType = wrapWithArray(stringifiedType);
        }

        if (!field.isRequired) {
          stringifiedType = wrapWithNullable(stringifiedType);
        }
      }

      return `${field.name}: ${stringifiedType}`;
    })
    .filter((x) => x) as string[];

  return `${getConfig().typeboxImportVariableName}.Object({${fields.join(
    ","
  )}},${generateTypeboxOptions({ input: annotations })})\n`;
}
