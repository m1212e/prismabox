import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations } from "../annotations/annotations";
import { generateTypeboxOptions } from "../annotations/options";
import { getConfig } from "../config";
import type { ProcessedModel } from "../model";
import { wrapWithPartial } from "./wrappers/partial";

export const processedSelect: ProcessedModel[] = [];

export function processSelect(models: DMMF.Model[] | Readonly<DMMF.Model[]>) {
  for (const m of models) {
    const o = stringifySelect(m);
    if (o) {
      processedSelect.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedSelect);
}

export function stringifySelect(data: DMMF.Model) {
  const annotations = extractAnnotations(data.documentation);

  if (annotations.isHidden) return undefined;

  const fields = data.fields
    .map((field) => {
      const annotations = extractAnnotations(field.documentation);
      if (annotations.isHidden) return undefined;

      return `${field.name}: ${getConfig().typeboxImportVariableName}.Boolean()`;
    })
    .filter((x) => x) as string[];

  fields.push(`_count: ${getConfig().typeboxImportVariableName}.Boolean()`);

  const ret = `${getConfig().typeboxImportVariableName}.Object({${[
    ...fields,
  ].join(",")}},${generateTypeboxOptions({ input: annotations })})\n`;

  return wrapWithPartial(ret);
}
