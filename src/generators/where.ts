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
import { wrapWithArray } from "./wrappers/array";
import { processedEnums } from "./enum";
import { wrapWithPartial } from "./wrappers/partial";
import { makeComposite } from "./wrappers/composite";
import { makeIntersection } from "./wrappers/intersect";
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

			return `${field.name}: ${stringifiedType}`;
		})
		.filter((x) => x) as string[];

	return wrapWithPartial(
		`${
			getConfig().typeboxImportVariableName
		}.Recursive(${selfReferenceName} =>${
			getConfig().typeboxImportVariableName
		}.Object({${AND_OR_NOT()},${fields.join(",")}},${generateTypeboxOptions(
			annotations,
		)}), { $id: "${data.name}"})`,
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

//     id?: string
//     conferenceId_nationId?: DelegationConferenceIdNationIdCompoundUniqueInput
//     AND?: DelegationWhereInput | DelegationWhereInput[]
//     OR?: DelegationWhereInput[]
//     NOT?: DelegationWhereInput | DelegationWhereInput[]
//     conferenceId?: StringFilter<"Delegation"> | string
//     nationId?: StringFilter<"Delegation"> | string
//   }, "id" | "conferenceId_nationId">

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
				stringifiedType = stringifyPrimitiveType({
					fieldType: f.type as PrimitivePrismaFieldType,
					options: generateTypeboxOptions(annotations),
				});
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
		)}}, ${generateTypeboxOptions()})`;

		return `${compositeName}: ${compositeObject}`;
	});

	const nonUniqueFields = data.fields
		.map((field) => {
			const annotations = extractAnnotations(field.documentation);
			if (annotations.isHidden) return undefined;
			if (field.isUnique || field.isId) return undefined;

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

			return `${field.name}: ${stringifiedType}`;
		})
		.filter((x) => x) as string[];

	const uniqueBaseObject = `${getConfig().typeboxImportVariableName}.Object({${[
		...uniqueFields,
		...uniqueCompositeFields,
	].join(",")}},${generateTypeboxOptions(annotations)})`;

	return `${
		getConfig().typeboxImportVariableName
	}.Recursive(${selfReferenceName} => ${makeIntersection([
		wrapWithPartial(uniqueBaseObject),
		makeUnion(
			[...uniqueFields, ...uniqueCompositeFields].map(
				(f) => `${getConfig().typeboxImportVariableName}.Object({${f}})`,
			),
		),
		wrapWithPartial(
			`${getConfig().typeboxImportVariableName}.Object({${AND_OR_NOT()}})`,
		),
		wrapWithPartial(
			`${getConfig().typeboxImportVariableName}.Object({${nonUniqueFields.join(
				",",
			)}})`,
		),
	])}, { $id: "${data.name}"})`;
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
