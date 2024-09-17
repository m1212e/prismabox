import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyRelations } from "./relations";

export const processedRelationsInclude: ProcessedModel[] = [];

export function processRelationsInclude(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyRelations(m, { isInputInclude: true });
    if (o) {
      processedRelationsInclude.push({
        name: m.name,
        stringRepresentation: o,
      });
    }
  }
  Object.freeze(processedRelationsInclude);
}
