import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyRelations } from "./relations";

export const processedRelationsSelect: ProcessedModel[] = [];

export function processRelationsSelect(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyRelations(m, { isInputSelect: true });
    if (o) {
      processedRelationsSelect.push({
        name: m.name,
        stringRepresentation: o,
      });
    }
  }
  Object.freeze(processedRelationsSelect);
}
