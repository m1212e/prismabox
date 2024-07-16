import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations } from "../annotations/annotations";
import { getConfig } from "../config";
import { generateTypeboxOptions } from "../annotations/options";
import type { ProcessedModel } from "../model";
import { isPrimitivePrismaFieldType } from "./primitiveField";
import { wrapWithArray } from "./wrappers/array";
import { wrapWithNullable } from "./wrappers/nullable";
import { processedEnums } from "./enum";
import { processedPlain } from "./plain";
import { wrapWithPartial } from "./wrappers/partial";

export const processedRelations: ProcessedModel[] = [];

export function processRelations(
	models: DMMF.Model[] | Readonly<DMMF.Model[]>,
) {
	for (const m of models) {
		const o = stringifyRelations(m);
		if (o) {
			processedRelations.push({ name: m.name, stringRepresentation: o });
		}
	}
	Object.freeze(processedRelations);
}

export function stringifyRelations(data: DMMF.Model) {
	const annotations = extractAnnotations(data.documentation);
	if (annotations.isHidden) return undefined;

	const fields = data.fields
		.map((field) => {
			const annotations = extractAnnotations(field.documentation);

			if (
				annotations.isHidden ||
				isPrimitivePrismaFieldType(field.type) ||
				processedEnums.find((e) => e.name === field.type)
			) {
				return undefined;
			}

			let stringifiedType = processedPlain.find(
				(e) => e.name === field.type,
			)?.stringRepresentation;

			if (!stringifiedType) {
				return undefined;
			}

			if (field.isList) {
				stringifiedType = wrapWithArray(stringifiedType);
			}

			if (!field.isRequired) {
				stringifiedType = wrapWithNullable(stringifiedType);
			}

			return `${field.name}: ${stringifiedType}`;
		})
		.filter((x) => x) as string[];

	return `${getConfig().typeboxImportVariableName}.Object({${fields.join(
		",",
	)}},${generateTypeboxOptions(annotations)})\n`;
}

export const processedRelationsInputCreate: ProcessedModel[] = [];

export function processRelationsInputCreate(
	models: DMMF.Model[] | Readonly<DMMF.Model[]>,
) {
	for (const m of models) {
		const o = stringifyRelationsInputCreate(m, models);
		if (o) {
			processedRelationsInputCreate.push({
				name: m.name,
				stringRepresentation: o,
			});
		}
	}
	Object.freeze(processedRelationsInputCreate);
}

export function stringifyRelationsInputCreate(
	data: DMMF.Model,
	allModels: DMMF.Model[] | Readonly<DMMF.Model[]>,
) {
	const annotations = extractAnnotations(data.documentation);
	if (annotations.isHidden || annotations.isHiddenInput) return undefined;

	const fields = data.fields
		.map((field) => {
			const annotations = extractAnnotations(field.documentation);

			if (
				annotations.isHidden ||
				annotations.isHiddenInput ||
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

			let connectString = `${getConfig().typeboxImportVariableName}.Object({
				id: ${
					getConfig().typeboxImportVariableName
				}.${typeboxIdType}(${generateTypeboxOptions(annotations)}),
			},${generateTypeboxOptions(annotations)})`;

			if (field.isList) {
				connectString = wrapWithArray(connectString);
			}

			let stringifiedType = `${getConfig().typeboxImportVariableName}.Object({
				connect: ${connectString},
			}, ${generateTypeboxOptions()})`;

			if (!field.isRequired || field.isList) {
				stringifiedType = `${
					getConfig().typeboxImportVariableName
				}.Optional(${stringifiedType})`;
			}

			return `${field.name}: ${stringifiedType}`;
		})
		.filter((x) => x) as string[];

	return `${getConfig().typeboxImportVariableName}.Object({${fields.join(
		",",
	)}},${generateTypeboxOptions(annotations)})\n`;
}

export const processedRelationsInputUpdate: ProcessedModel[] = [];

export function processRelationsInputUpdate(
	models: DMMF.Model[] | Readonly<DMMF.Model[]>,
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

export function stringifyRelationsInputUpdate(data: DMMF.Model, allModels: DMMF.Model[] | Readonly<DMMF.Model[]>) {
	const annotations = extractAnnotations(data.documentation);
	if (annotations.isHidden || annotations.isHiddenInput) return undefined;

	const fields = data.fields
		.map((field) => {
			const annotations = extractAnnotations(field.documentation);

			if (
				annotations.isHidden ||
				annotations.isHiddenInput ||
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
								}.${typeboxIdType}(${generateTypeboxOptions(annotations)})
							}, ${generateTypeboxOptions(annotations)})`)},
						disconnect: ${wrapWithArray(`${
							getConfig().typeboxImportVariableName
						}.Object({
								id: ${
									getConfig().typeboxImportVariableName
								}.${typeboxIdType}(${generateTypeboxOptions(annotations)})
							}, ${generateTypeboxOptions(annotations)})`)}
					}, ${generateTypeboxOptions(annotations)})`);
			} else {
				if (field.isRequired) {
					stringifiedType = `${getConfig().typeboxImportVariableName}.Object({
						connect: ${getConfig().typeboxImportVariableName}.Object({
							id: ${
								getConfig().typeboxImportVariableName
							}.${typeboxIdType}(${generateTypeboxOptions(annotations)})
						}, ${generateTypeboxOptions(annotations)})
					}, ${generateTypeboxOptions(annotations)})`;
				} else {
					stringifiedType = wrapWithPartial(`${
						getConfig().typeboxImportVariableName
					}.Object({
						connect: ${getConfig().typeboxImportVariableName}.Object({
							id: ${
								getConfig().typeboxImportVariableName
							}.${typeboxIdType}(${generateTypeboxOptions(annotations)})
						}, ${generateTypeboxOptions(annotations)}),
						disconnect: ${getConfig().typeboxImportVariableName}.Boolean()
					}, ${generateTypeboxOptions(annotations)})`);
				}
			}

			return `${field.name}: ${stringifiedType}`;
		})
		.filter((x) => x) as string[];

	return wrapWithPartial(
		`${getConfig().typeboxImportVariableName}.Object({${fields.join(
			",",
		)}},${generateTypeboxOptions(annotations)})`,
	);
}
