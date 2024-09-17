import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyPlain } from "./plain";
import { makeEnum } from "./enum";

const stringifiedOrderDirectionEnum = makeEnum(["asc", "desc"]);

export const processedPlainOrderBy: ProcessedModel[] = [];

export function processPlainOrderBy(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyPlain(m, { isInputOrderBy: true });
    if (o) {
      processedPlainOrderBy.push({
        name: m.name,
        stringRepresentation: o,
      });
    }
  }
  Object.freeze(processedPlainOrderBy);
}
