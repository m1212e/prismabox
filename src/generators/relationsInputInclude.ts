import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyRelations } from "./relations";

export const processedRelationsInputInclude: ProcessedModel[] = [];

export function processRelationsInputInclude(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyRelations(m, { isInputInclude: true });
    if (o) {
      processedRelationsInputInclude.push({
        name: m.name,
        stringRepresentation: o,
      });
    }
  }
  Object.freeze(processedRelationsInputInclude);
}
