import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyRelations } from "./relations";

export const processedRelationsInputSelect: ProcessedModel[] = [];

export function processRelationsInputSelect(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyRelations(m, { isInputSelect: true });
    if (o) {
      processedRelationsInputSelect.push({
        name: m.name,
        stringRepresentation: o,
      });
    }
  }
  Object.freeze(processedRelationsInputSelect);
}
