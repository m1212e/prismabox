import type { DMMF } from "@prisma/generator-helper";
import {
  extractAnnotations,
  isTypeOverwriteVariant,
} from "../annotations/annotations";
import { generateTypeboxOptions } from "../annotations/options";
import { getConfig } from "../config";
import type { ProcessedModel } from "../model";
import { processedEnums } from "./enum";
import {
  type PrimitivePrismaFieldType,
  isPrimitivePrismaFieldType,
  stringifyPrimitiveType,
} from "./primitiveField";
import { wrapWithArray } from "./wrappers/array";
import { makeIntersection } from "./wrappers/intersect";
import { wrapWithPartial } from "./wrappers/partial";
import { makeUnion } from "./wrappers/union";

const selfReferenceName = "Self";

export const processedWhere: ProcessedModel[] = [];

export function processWhere(models: DMMF.Model[] | Readonly<DMMF.Model[]>) {
  for (const m of models) {
    const o = stringifyWhere(m);
    if (o) {
      processedWhere.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedWhere);
}

export function stringifyWhere(data: DMMF.Model) {
  const annotations = extractAnnotations(data.documentation);
  if (annotations.isHidden) return undefined;

  const fields = data.fields
    .map((field) => {
      const annotations = extractAnnotations(field.documentation);
      if (annotations.isHidden) return undefined;

      let stringifiedType = "";

      if (isPrimitivePrismaFieldType(field.type)) {
        const overwrittenType = annotations.annotations
          .filter(isTypeOverwriteVariant)
          .at(0)?.value;

        if (overwrittenType) {
          stringifiedType = overwrittenType;
        } else {
          stringifiedType = stringifyPrimitiveType({
            fieldType: field.type as PrimitivePrismaFieldType,
            options: generateTypeboxOptions({
              exludeAdditionalProperties: false,
              input: annotations,
            }),
          });
        }
      } else if (processedEnums.find((e) => e.name === field.type)) {
        // biome-ignore lint/style/noNonNullAssertion: we checked this manually
        stringifiedType = processedEnums.find(
          (e) => e.name === field.type,
        )!.stringRepresentation;
      } else {
        return undefined;
      }

      if (field.isList) {
        stringifiedType = wrapWithArray(stringifiedType);
      }

      return `${field.name}: ${stringifiedType}`;
    })
    .filter((x) => x) as string[];

  if (getConfig().allowRecursion) {
    return wrapWithPartial(
      `${
        getConfig().typeboxImportVariableName
      }.Recursive(${selfReferenceName} =>${
        getConfig().typeboxImportVariableName
      }.Object({${AND_OR_NOT()},${fields.join(",")}},${generateTypeboxOptions({
        exludeAdditionalProperties: true,
        input: annotations,
      })}), { $id: "${data.name}"})`,
    );
  }

  return wrapWithPartial(
    `${getConfig().typeboxImportVariableName}.Object({${fields.join(
      ",",
    )}},${generateTypeboxOptions({ exludeAdditionalProperties: true, input: annotations })})`,
  );
}

export const processedWhereUnique: ProcessedModel[] = [];

export function processWhereUnique(
  models: DMMF.Model[] | Readonly<DMMF.Model[]>,
) {
  for (const m of models) {
    const o = stringifyWhereUnique(m);
    if (o) {
      processedWhereUnique.push({ name: m.name, stringRepresentation: o });
    }
  }
  Object.freeze(processedWhereUnique);
}

export function stringifyWhereUnique(data: DMMF.Model) {
  const annotations = extractAnnotations(data.documentation);
  if (annotations.isHidden) return undefined;

  const uniqueCompositeFields = data.uniqueFields.map((fields) => {
    const compositeName = fields.join("_");
    const fieldObjects = fields.map(
      // biome-ignore lint/style/noNonNullAssertion: this must exist
      (f) => data.fields.find((field) => field.name === f)!,
    );

    const stringifiedFieldObjects = fieldObjects.map((f) => {
      const annotations = extractAnnotations(f.documentation);
      if (annotations.isHidden) return undefined;
      let stringifiedType = "";

      if (isPrimitivePrismaFieldType(f.type)) {
        const overwrittenType = annotations.annotations
          .filter(isTypeOverwriteVariant)
          .at(0)?.value;

        if (overwrittenType) {
          stringifiedType = overwrittenType;
        } else {
          stringifiedType = stringifyPrimitiveType({
            fieldType: f.type as PrimitivePrismaFieldType,
            options: generateTypeboxOptions({
              exludeAdditionalProperties: false,
              input: annotations,
            }),
          });
        }
      } else if (processedEnums.find((e) => e.name === f.type)) {
        // biome-ignore lint/style/noNonNullAssertion: we checked this manually
        stringifiedType = processedEnums.find(
          (e) => e.name === f.type,
        )!.stringRepresentation;
      } else {
        throw new Error("Invalid type for unique composite generation");
      }

      return `${f.name}: ${stringifiedType}`;
    });

    const compositeObject = `${
      getConfig().typeboxImportVariableName
    }.Object({${stringifiedFieldObjects.join(
      ",",
    )}}, ${generateTypeboxOptions({ exludeAdditionalProperties: true })})`;

    return `${compositeName}: ${compositeObject}`;
  });

  const allFields = data.fields
    .map((field) => {
      const annotations = extractAnnotations(field.documentation);
      if (annotations.isHidden) return undefined;

      let stringifiedType = "";

      if (isPrimitivePrismaFieldType(field.type)) {
        const overwrittenType = annotations.annotations
          .filter(isTypeOverwriteVariant)
          .at(0)?.value;

        if (overwrittenType) {
          stringifiedType = overwrittenType;
        } else {
          stringifiedType = stringifyPrimitiveType({
            fieldType: field.type as PrimitivePrismaFieldType,
            options: generateTypeboxOptions({
              exludeAdditionalProperties: false,
              input: annotations,
            }),
          });
        }
      } else if (processedEnums.find((e) => e.name === field.type)) {
        // biome-ignore lint/style/noNonNullAssertion: we checked this manually
        stringifiedType = processedEnums.find(
          (e) => e.name === field.type,
        )!.stringRepresentation;
      } else {
        return undefined;
      }

      if (field.isList) {
        stringifiedType = wrapWithArray(stringifiedType);
      }

      return `${field.name}: ${stringifiedType}`;
    })
    .filter((x) => x) as string[];

  const uniqueFields = data.fields
    .map((field) => {
      const annotations = extractAnnotations(field.documentation);
      if (annotations.isHidden) return undefined;
      if (!field.isUnique && !field.isId) return undefined;

      let stringifiedType = "";

      if (isPrimitivePrismaFieldType(field.type)) {
        const overwrittenType = annotations.annotations
          .filter(isTypeOverwriteVariant)
          .at(0)?.value;

        if (overwrittenType) {
          stringifiedType = overwrittenType;
        } else {
          stringifiedType = stringifyPrimitiveType({
            fieldType: field.type as PrimitivePrismaFieldType,
            options: generateTypeboxOptions({
              exludeAdditionalProperties: false,
              input: annotations,
            }),
          });
        }
      } else if (processedEnums.find((e) => e.name === field.type)) {
        // biome-ignore lint/style/noNonNullAssertion: we checked this manually
        stringifiedType = processedEnums.find(
          (e) => e.name === field.type,
        )!.stringRepresentation;
      } else {
        return undefined;
      }

      if (field.isList) {
        stringifiedType = wrapWithArray(stringifiedType);
      }

      return `${field.name}: ${stringifiedType}`;
    })
    .filter((x) => x) as string[];

  const uniqueBaseObject = `${getConfig().typeboxImportVariableName}.Object({${[
    ...uniqueFields,
    ...uniqueCompositeFields,
  ].join(
    ",",
  )}},${generateTypeboxOptions({ exludeAdditionalProperties: true, input: annotations })})`;

  if (getConfig().allowRecursion) {
    return `${
      getConfig().typeboxImportVariableName
    }.Recursive(${selfReferenceName} => ${makeIntersection([
      wrapWithPartial(uniqueBaseObject, true),
      makeUnion(
        [...uniqueFields, ...uniqueCompositeFields].map(
          (f) => `${getConfig().typeboxImportVariableName}.Object({${f}})`,
        ),
      ),
      wrapWithPartial(
        `${getConfig().typeboxImportVariableName}.Object({${AND_OR_NOT()}})`,
        true,
      ),
      wrapWithPartial(
        `${
          getConfig().typeboxImportVariableName
        }.Object({${allFields.join(",")}}, ${generateTypeboxOptions()})`,
      ),
    ])}, { $id: "${data.name}"})`;
  }

  return makeIntersection([
    wrapWithPartial(uniqueBaseObject, true),
    makeUnion(
      [...uniqueFields, ...uniqueCompositeFields].map(
        (f) => `${getConfig().typeboxImportVariableName}.Object({${f}})`,
      ),
    ),
    wrapWithPartial(
      `${getConfig().typeboxImportVariableName}.Object({${allFields.join(
        ",",
      )}})`,
    ),
  ]);
}

function AND_OR_NOT() {
  return `AND: ${
    getConfig().typeboxImportVariableName
  }.Union([${selfReferenceName}, ${wrapWithArray(selfReferenceName)}]),
	NOT: ${
    getConfig().typeboxImportVariableName
  }.Union([${selfReferenceName}, ${wrapWithArray(selfReferenceName)}]),
	OR: ${wrapWithArray(selfReferenceName)}`;
}
