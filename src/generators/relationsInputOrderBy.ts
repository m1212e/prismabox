import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyRelations } from "./relations";

export const processedRelationsInputOrderBy: ProcessedModel[] = [];

export function processRelationsInputOrderBy(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyRelations(m, { isInputOrderBy: true });
    if (o) {
      processedRelationsInputOrderBy.push({
        name: m.name,
        stringRepresentation: o,
      });
    }
  }
  Object.freeze(processedRelationsInputOrderBy);
}
