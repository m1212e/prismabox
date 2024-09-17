import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations } from "../annotations/annotations";
import { generateTypeboxOptions } from "../annotations/options";
import { getConfig } from "../config";
import type { ProcessedModel } from "../model";
import { makeEnum, processedEnums, stringifyEnum } from "./enum";
import {
  type PrimitivePrismaFieldType,
  isPrimitivePrismaFieldType,
  stringifyPrimitiveType,
} from "./primitiveField";
import { wrapWithArray } from "./wrappers/array";
import { wrapWithNullable } from "./wrappers/nullable";
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

type StringifyPlainOption = {
  isInputModelCreate?: boolean;
  isInputModelUpdate?: boolean;
  isInputSelect?: boolean;
  isInputOrderBy?: boolean;
};

export function stringifyPlain(data: DMMF.Model, opt?: StringifyPlainOption) {
  const annotations = extractAnnotations(data.documentation);

  const stringifyBoolean = stringifyPrimitiveType({
    fieldType: "Boolean",
    options: generateTypeboxOptions({ input: annotations }),
  });
  const stringifyOrderBy = makeEnum(["asc", "desc"]);

  if (
    annotations.isHidden ||
    ((opt?.isInputModelCreate || opt?.isInputModelUpdate) &&
      annotations.isHiddenInput) ||
    (opt?.isInputModelCreate && annotations.isHiddenInputCreate) ||
    (opt?.isInputModelUpdate && annotations.isHiddenInputUpdate)
  )
    return undefined;

  const fields = data.fields
    .map((field) => {
      const annotations = extractAnnotations(field.documentation);
      if (
        annotations.isHidden ||
        ((opt?.isInputModelCreate || opt?.isInputModelUpdate) &&
          annotations.isHiddenInput) ||
        (opt?.isInputModelCreate && annotations.isHiddenInputCreate) ||
        (opt?.isInputModelUpdate && annotations.isHiddenInputUpdate)
      )
        return undefined;

      // ===============================
      // INPUT MODEL FILTERS
      // ===============================
      // if we generate an input model we want to omit certain fields

      if (
        getConfig().ignoreIdOnInputModel &&
        (opt?.isInputModelCreate || opt?.isInputModelUpdate) &&
        field.isId
      )
        return undefined;
      if (
        getConfig().ignoreCreatedAtOnInputModel &&
        (opt?.isInputModelCreate || opt?.isInputModelUpdate) &&
        field.name === "createdAt" &&
        field.hasDefaultValue
      )
        return undefined;
      if (
        getConfig().ignoreUpdatedAtOnInputModel &&
        (opt?.isInputModelCreate || opt?.isInputModelUpdate) &&
        field.isUpdatedAt
      )
        return undefined;

      if (
        (opt?.isInputModelCreate || opt?.isInputModelUpdate) &&
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

      if (opt?.isInputSelect) {
        if (isPrimitivePrismaFieldType(field.type)) {
          stringifiedType = wrapWithOptional(stringifyBoolean);
        } else {
          return undefined;
        }
      } else if (opt?.isInputOrderBy) {
        stringifiedType = wrapWithOptional(stringifyOrderBy);
      } else {
        if (isPrimitivePrismaFieldType(field.type)) {
          stringifiedType = stringifyPrimitiveType({
            fieldType: field.type as PrimitivePrismaFieldType,
            options: generateTypeboxOptions({ input: annotations }),
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

        let madeOptional = false;

        if (!field.isRequired) {
          stringifiedType = wrapWithNullable(stringifiedType);
          if (opt?.isInputModelCreate) {
            stringifiedType = wrapWithOptional(stringifiedType);
          }
        }

        if (opt?.isInputModelUpdate) {
          stringifiedType = wrapWithOptional(stringifiedType);
          madeOptional = true;
        }

        if (
          !madeOptional &&
          field.hasDefaultValue &&
          (opt?.isInputModelCreate || opt?.isInputModelUpdate)
        ) {
          stringifiedType = wrapWithOptional(stringifiedType);
          madeOptional = true;
        }
      }

      return `${field.name}: ${stringifiedType}`;
    })
    .filter((x) => x) as string[];

  return `${getConfig().typeboxImportVariableName}.Object({${[
    ...fields,
    opt?.isInputSelect
      ? [`_count: ${wrapWithOptional(stringifyBoolean)}`]
      : !opt?.isInputOrderBy &&
          !(opt?.isInputModelCreate || opt?.isInputModelUpdate)
        ? getConfig().additionalFieldsPlain ?? []
        : [],
  ].join(",")}},${generateTypeboxOptions({ input: annotations })})\n`;
}
