import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyPlain } from "./plain";
import { stringifyPrimitiveType } from "./primitiveField";
import { generateTypeboxOptions } from "../annotations/options";

const stringifiedBoolean = stringifyPrimitiveType({
  fieldType: "Boolean",
  options: generateTypeboxOptions(),
});

export const processedPlainSelect: ProcessedModel[] = [];

export function processPlainSelect(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyPlain(m, { isInputSelect: true });
    if (o) {
      processedPlainSelect.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedPlainSelect);
}
