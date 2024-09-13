import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations } from "../annotations/annotations";
import { generateTypeboxOptions } from "../annotations/options";
import { getConfig } from "../config";
import type { ProcessedModel } from "../model";
import { processedEnums } from "./enum";
import { isPrimitivePrismaFieldType } from "./primitiveField";
import { wrapWithArray } from "./wrappers/array";
import { wrapWithPartial } from "./wrappers/partial";

export const processedRelationsInputUpdate: ProcessedModel[] = [];

export function processRelationsInputUpdate(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  for (const m of models) {
    const o = stringifyRelationsInputUpdate(m, models);
    if (o) {
      processedRelationsInputUpdate.push({
        name: m.name,
        stringRepresentation: o,
      });
    }
  }
  Object.freeze(processedRelationsInputUpdate);
}

export function stringifyRelationsInputUpdate(
  data: DMMF.Model,
  allModels: DMMF.Model[] | Readonly<DMMF.Model[]>
) {
  const annotations = extractAnnotations(data.documentation);
  if (
    annotations.isHidden ||
    annotations.isHiddenInput ||
    annotations.isHiddenInputUpdate
  )
    return undefined;

  const fields = data.fields
    .map((field) => {
      const annotations = extractAnnotations(field.documentation);

      if (
        annotations.isHidden ||
        annotations.isHiddenInput ||
        annotations.isHiddenInputUpdate ||
        isPrimitivePrismaFieldType(field.type) ||
        processedEnums.find((e) => e.name === field.type)
      ) {
        return undefined;
      }

      let typeboxIdType = "String";

      switch (
        allModels.find((m) => m.name === field.type)?.fields.find((f) => f.isId)
          ?.type
      ) {
        case "String":
          typeboxIdType = "String";
          break;
        case "Int":
          typeboxIdType = "Integer";
          break;
        case "BigInt":
          typeboxIdType = "Integer";
          break;
        default:
          throw new Error("Unsupported id type");
      }

      let stringifiedType: string;

      if (field.isList) {
        stringifiedType = wrapWithPartial(`${
          getConfig().typeboxImportVariableName
        }.Object({
						connect: ${wrapWithArray(`${getConfig().typeboxImportVariableName}.Object({
								id: ${
                  getConfig().typeboxImportVariableName
                }.${typeboxIdType}(${generateTypeboxOptions({ input: annotations })})
							}, ${generateTypeboxOptions({ input: annotations })})`)},
						disconnect: ${wrapWithArray(`${getConfig().typeboxImportVariableName}.Object({
								id: ${
                  getConfig().typeboxImportVariableName
                }.${typeboxIdType}(${generateTypeboxOptions({ input: annotations })})
							}, ${generateTypeboxOptions({ input: annotations })})`)}
					}, ${generateTypeboxOptions({ input: annotations })})`);
      } else {
        if (field.isRequired) {
          stringifiedType = `${getConfig().typeboxImportVariableName}.Object({
						connect: ${getConfig().typeboxImportVariableName}.Object({
							id: ${
                getConfig().typeboxImportVariableName
              }.${typeboxIdType}(${generateTypeboxOptions({ input: annotations })})
						}, ${generateTypeboxOptions({ input: annotations })})
					}, ${generateTypeboxOptions({ input: annotations })})`;
        } else {
          stringifiedType = wrapWithPartial(`${
            getConfig().typeboxImportVariableName
          }.Object({
						connect: ${getConfig().typeboxImportVariableName}.Object({
							id: ${
                getConfig().typeboxImportVariableName
              }.${typeboxIdType}(${generateTypeboxOptions({ input: annotations })})
						}, ${generateTypeboxOptions({ input: annotations })}),
						disconnect: ${getConfig().typeboxImportVariableName}.Boolean()
					}, ${generateTypeboxOptions({ input: annotations })})`);
        }
      }

      return `${field.name}: ${stringifiedType}`;
    })
    .filter((x) => x) as string[];

  return wrapWithPartial(
    `${getConfig().typeboxImportVariableName}.Object({${fields.join(
      ","
    )}},${generateTypeboxOptions({ input: annotations })})`
  );
}
