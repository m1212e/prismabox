import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyPlain } from "./plain";

export const processedPlainInputCreate: ProcessedModel[] = [];

export function processPlainInputCreate(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>,
) {
  for (const m of models) {
    const o = stringifyPlain(m, true, false);
    if (o) {
      processedPlainInputCreate.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedPlainInputCreate);
}
