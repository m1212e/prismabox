import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations } from "../annotations/annotations";
import { generateTypeboxOptions } from "../annotations/options";
import { getConfig } from "../config";
import type { ProcessedModel } from "../model";
import { wrapWithPartial } from "./wrappers/partial";
import { makeUnion } from "./wrappers/union";
import { isPrimitivePrismaFieldType } from "./primitiveField";

export const processedOrderBy: ProcessedModel[] = [];

export function processOrderBy(models: DMMF.Model[] | Readonly<DMMF.Model[]>) {
  for (const m of models) {
    const o = stringifyOrderBy(m);
    if (o) {
      processedOrderBy.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedOrderBy);
}

export function stringifyOrderBy(data: DMMF.Model) {
  const annotations = extractAnnotations(data.documentation);

  if (annotations.isHidden) return undefined;

  const fields = data.fields
    .map((field) => {
      const annotations = extractAnnotations(field.documentation);
      if (annotations.isHidden) return undefined;

      if (isPrimitivePrismaFieldType(field.type)) {
        return `${field.name}: ${makeUnion([
          `${getConfig().typeboxImportVariableName}.Literal('asc')`,
          `${getConfig().typeboxImportVariableName}.Literal('desc')`,
        ])}`;
      }

      //TODO if this is a many to one relation this is the wrong schema
      // return `${field.name}: ${getConfig().typeboxImportVariableName}.Object({_count: ${makeUnion(
      //   [
      //     `${getConfig().typeboxImportVariableName}.Literal('asc')`,
      //     `${getConfig().typeboxImportVariableName}.Literal('desc')`,
      //   ]
      // )}})`;
    })
    .filter((x) => x) as string[];

  const ret = `${getConfig().typeboxImportVariableName}.Object({${[
    ...fields,
  ].join(",")}},${generateTypeboxOptions({ input: annotations })})\n`;

  return wrapWithPartial(ret);
}
