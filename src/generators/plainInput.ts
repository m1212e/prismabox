import type { DMMF } from "@prisma/generator-helper";
import type { ProcessedModel } from "../model";
import { stringifyPlain } from "./plain";

export const processedPlainInput: ProcessedModel[] = [];

export function processPlainInput(
	models: DMMF.Model[] | Readonly<DMMF.Model[]>,
) {
	for (const m of models) {
		const o = stringifyPlain(m, true);
		if (o) {
			processedPlainInput.push({ name: m.name, stringRepresentation: o });
		}
	}
	Object.freeze(processedPlainInput);
}
