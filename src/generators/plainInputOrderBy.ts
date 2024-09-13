import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyPlain } from "./plain";

export const processedPlainInputOrderBy: ProcessedModel[] = [];

export function processPlainInputOrderBy(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyPlain(m, { isInputOrderBy: true });
    if (o) {
      processedPlainInputOrderBy.push({
        name: m.name,
        stringRepresentation: o,
      });
    }
  }
  Object.freeze(processedPlainInputOrderBy);
}
