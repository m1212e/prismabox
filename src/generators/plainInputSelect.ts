import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyPlain } from "./plain";

export const processedPlainInputSelect: ProcessedModel[] = [];

export function processPlainInputSelect(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyPlain(m, { isInputSelect: true });
    if (o) {
      processedPlainInputSelect.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedPlainInputSelect);
}
