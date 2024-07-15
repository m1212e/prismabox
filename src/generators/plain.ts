import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations } from "../annotations/annotations";
import { getConfig } from "../config";
import { generateTypeboxOptions } from "../annotations/options";
import type { ProcessedModel } from "../model";
import {
  isPrimitivePrismaFieldType,
  stringifyPrimitiveType,
  type PrimitivePrismaFieldType,
} from "./primitiveField";
import { wrapWithArray } from "./wrappers/array";
import { wrapWithNullable } from "./wrappers/nullable";
import { processedEnums } from "./enum";
import { wrapWithOptional } from "./wrappers/optional";

export const processedPlain: ProcessedModel[] = [];

export function processPlain(models: DMMF.Model[] | Readonly<DMMF.Model[]>) {
  for (const m of models) {
    const o = stringifyPlain(m);
    if (o) {
      processedPlain.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedPlain);
}

export function stringifyPlain(data: DMMF.Model, isInputModel = false) {
  const annotations = extractAnnotations(data.documentation);
  if (annotations.isHidden || (isInputModel && annotations.isHiddenInput))
    return undefined;

  const fields = data.fields
    .map((field) => {
      const annotations = extractAnnotations(field.documentation);
      if (annotations.isHidden || (isInputModel && annotations.isHiddenInput))
        return undefined;

      // ===============================
      // INPUT MODEL FILTERS
      // ===============================
      // if we generate an input model we want to omit certain fields

      if (getConfig().ignoreIdOnInputModel && isInputModel && field.isId)
        return undefined;
      if (
        getConfig().ignoreCreatedAtOnInputModel &&
        isInputModel &&
        field.name === "createdAt" &&
        field.hasDefaultValue
      )
        return undefined;
      if (
        getConfig().ignoreUpdatedAtOnInputModel &&
        isInputModel &&
        field.isUpdatedAt
      )
        return undefined;

      if (
        isInputModel &&
        (field.name.toLowerCase().endsWith("id") ||
          field.name.toLowerCase().endsWith("foreign") ||
          field.name.toLowerCase().endsWith("foreignkey"))
      ) {
        return undefined;
      }

      // ===============================
      // INPUT MODEL FILTERS END
      // ===============================

      let stringifiedType = "";

      if (isPrimitivePrismaFieldType(field.type)) {
        stringifiedType = stringifyPrimitiveType({
          fieldType: field.type as PrimitivePrismaFieldType,
          options: generateTypeboxOptions(annotations),
        });
      } else if (processedEnums.find((e) => e.name === field.type)) {
        // biome-ignore lint/style/noNonNullAssertion: we checked this manually
        stringifiedType = processedEnums.find(
          (e) => e.name === field.type
        )!.stringRepresentation;
      } else {
        return undefined;
      }

      if (field.isList) {
        stringifiedType = wrapWithArray(stringifiedType);
      }

      if (!field.isRequired) {
        stringifiedType = wrapWithNullable(stringifiedType);
        if (isInputModel) {
          stringifiedType = wrapWithOptional(stringifiedType);
        }
      }

      return `${field.name}: ${stringifiedType}`;
    })
    .filter((x) => x) as string[];

  return `${getConfig().typeboxImportVariableName}.Object({${[
    ...fields,
    getConfig().additionalFieldsPlain ?? [],
  ].join(",")}},${generateTypeboxOptions(annotations)})\n`;
}
