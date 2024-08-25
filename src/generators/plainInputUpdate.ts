import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyPlain } from "./plain";

export const processedPlainInputUpdate: ProcessedModel[] = [];

export function processPlainInputUpdate(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyPlain(m, false, true);
    if (o) {
      processedPlainInputUpdate.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedPlainInputUpdate);
}
