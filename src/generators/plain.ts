import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations } from "../annotations/annotations";
import { getConfig } from "../config";
import { generateTypeboxOptions } from "../annotations/options";
import type { ProcessedModel } from "../model";
import {
	isPrimitivePrismaFieldType,
	stringifyPrimitiveType,
	type PrimitivePrismaFieldType,
} from "./primitiveField";
import { wrapWithArray } from "./array";
import { NullableVariant, wrapWithNullable } from "./nullable";
import { processedEnums } from "./enum";

export const processedPlain: ProcessedModel[] = [];

export function processPlain(models: DMMF.Model[] | Readonly<DMMF.Model[]>) {
	for (const m of models) {
		const o = stringifyPlain(m);
		if (o) {
			processedPlain.push({ name: `${m.name}`, ...o });
		}
	}
	Object.freeze(processedPlain);
}

export function stringifyPlain(data: DMMF.Model) {
	const annotations = extractAnnotations(data.documentation);
	if (annotations.isHidden) return undefined;
	let needsNullableImport = false;

	const fields = data.fields
		.map((field) => {
			const annotations = extractAnnotations(field.documentation);
			if (annotations.isHidden) return undefined;
			let stringifiedType = "";

			if (isPrimitivePrismaFieldType(field.type)) {
				stringifiedType = stringifyPrimitiveType({
					fieldType: field.type as PrimitivePrismaFieldType,
					options: generateTypeboxOptions(annotations),
				});
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

			if (!field.isRequired) {
				needsNullableImport = true;
				stringifiedType = wrapWithNullable({
					input: stringifiedType,
					variant: NullableVariant.NULLABLE,
				});
			}

			return `${field.name}: ${stringifiedType}`;
		})
		.filter((x) => x) as string[];

	return {
		stringRepresentation: `${
			getConfig().typeboxImportVariableName
		}.Object({${fields.join(",")}},${generateTypeboxOptions(annotations)})\n`,
		needsNullableImport,
	};
}
