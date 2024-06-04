import type { DMMF } from "@prisma/generator-helper";
import { extractAnnotations } from "../annotations/annotations";
import { getConfig } from "../config";
import { generateTypeboxOptions } from "../annotations/options";
import type { ProcessedModel } from "../model";
import { isPrimitivePrismaFieldType } from "./primitiveField";
import { wrapWithArray } from "./array";
import { wrapWithNullable } from "./nullable";
import { processedEnums } from "./enum";
import { processedPlain } from "./plain";

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
				throw new Error("Could not find type for relation field.");
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
		const o = stringifyRelationsInputCreate(m);
		if (o) {
			processedRelationsInputCreate.push({
				name: m.name,
				stringRepresentation: o,
			});
		}
	}
	Object.freeze(processedRelationsInputCreate);
}

export function stringifyRelationsInputCreate(data: DMMF.Model) {
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

			let connectString = `${getConfig().typeboxImportVariableName}.Object({
				id: ${
					getConfig().typeboxImportVariableName
				}.String(${generateTypeboxOptions(annotations)}),
			},${generateTypeboxOptions(annotations)})`;

			if (field.isList) {
				connectString = wrapWithArray(connectString);
			}

			let stringifiedType = `${getConfig().typeboxImportVariableName}.Object({
				connect: ${connectString},
			}, ${generateTypeboxOptions()})`;

			if (!field.isRequired) {
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
		const o = stringifyRelationsInputUpdate(m);
		if (o) {
			processedRelationsInputUpdate.push({
				name: m.name,
				stringRepresentation: o,
			});
		}
	}
	Object.freeze(processedRelationsInputUpdate);
}

export function stringifyRelationsInputUpdate(data: DMMF.Model) {
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

			let stringifiedType: string;

			if (field.isList) {
				stringifiedType = `${getConfig().typeboxImportVariableName}.Partial(
					${getConfig().typeboxImportVariableName}.Object({
						connect: ${getConfig().typeboxImportVariableName}.Array(
							${getConfig().typeboxImportVariableName}.Object({
								id: ${
									getConfig().typeboxImportVariableName
								}.String(${generateTypeboxOptions(annotations)})
							}, ${generateTypeboxOptions(annotations)})
						),
						disconnect: ${getConfig().typeboxImportVariableName}.Array(
							${getConfig().typeboxImportVariableName}.Object({
								id: ${
									getConfig().typeboxImportVariableName
								}.String(${generateTypeboxOptions(annotations)})
							}, ${generateTypeboxOptions(annotations)})
						)
					}, ${generateTypeboxOptions(annotations)})
				)`;
			} else {
				if (field.isRequired) {
					stringifiedType = `${getConfig().typeboxImportVariableName}.Object({
						connect: ${getConfig().typeboxImportVariableName}.Object({
							id: ${
								getConfig().typeboxImportVariableName
							}.String(${generateTypeboxOptions(annotations)})
						}, ${generateTypeboxOptions(annotations)})
					}, ${generateTypeboxOptions(annotations)})`;
				} else {
					stringifiedType = `${getConfig().typeboxImportVariableName}.Partial(${
						getConfig().typeboxImportVariableName
					}.Object({
						connect: ${getConfig().typeboxImportVariableName}.Object({
							id: ${
								getConfig().typeboxImportVariableName
							}.String(${generateTypeboxOptions(annotations)})
						}, ${generateTypeboxOptions(annotations)}),
						disconnect: ${getConfig().typeboxImportVariableName}.Boolean()
					}, ${generateTypeboxOptions(annotations)}))`;
				}
			}

			return `${field.name}: ${stringifiedType}`;
		})
		.filter((x) => x) as string[];

	return `${getConfig().typeboxImportVariableName}.Partial(${
		getConfig().typeboxImportVariableName
	}.Object({${fields.join(",")}},${generateTypeboxOptions(annotations)}))\n`;
}
