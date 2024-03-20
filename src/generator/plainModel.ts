import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import { Annotation, parseDocumentation } from "./documentation";

export function PlainModel(data: Pick<DMMF.Model, "fields">, options?: string) {
	const fields = data.fields
		.map((field) => {
			if (!isPrimitivePrismaFieldType(field.type)) return undefined;
			const doc = parseDocumentation(field.documentation);
			if (doc.annotations.includes(Annotation.HIDDEN)) return undefined;

			return PrimitiveField({
				name: field.name,
				fieldType: field.type,
				list: field.isList,
				optional: !field.isRequired,
				options: doc.options,
			});
		})
		.filter((x) => x) as string[];

	return `${typeboxImportVariableName}.Object({${fields.join(",")}}${
		options ? "," + options : ""
	})\n`;
}

type PrimitivePrismaFieldType =
	| "Int"
	| "Float"
	| "Decimal"
	| "BigInt"
	| "String"
	| "DateTime"
	| "Json"
	| "Date"
	| "Boolean";

export function isPrimitivePrismaFieldType(
	str: string,
): str is PrimitivePrismaFieldType {
	return [
		"Int",
		"BigInt",
		"Float",
		"Decimal",
		"String",
		"DateTime",
		"Date",
		"Json",
		"Boolean",
	].includes(str);
}

function PrimitiveField({
	name,
	fieldType,
	options,
	optional,
	list,
}: {
	fieldType: PrimitivePrismaFieldType;
	options: string;
	name: string;
	optional: boolean;
	list: boolean;
}) {
	let ret = `${name}: `;

	if (optional) {
		ret += `${typeboxImportVariableName}.Optional(`;
	}

	if (list) {
		ret += `${typeboxImportVariableName}.Array(`;
	}

	if (["Int", "BigInt"].includes(fieldType)) {
		ret += `${typeboxImportVariableName}.Integer(${options})`;
	} else if (["Float", "Decimal"].includes(fieldType)) {
		ret += `${typeboxImportVariableName}.Number(${options})`;
	} else if (fieldType === "String") {
		ret += `${typeboxImportVariableName}.String(${options})`;
	} else if (["DateTime", "Date"].includes(fieldType)) {
		ret += `${typeboxImportVariableName}.Date(${options})`;
	} else if (fieldType === "Json") {
		ret += `${typeboxImportVariableName}.Any(${options})`;
	} else if (fieldType === "Boolean") {
		ret += `${typeboxImportVariableName}.Boolean(${options})`;
	} else throw new Error("Invalid type for primitive generation");

	if (optional) {
		ret += ")";
	}

	if (list) {
		ret += ")";
	}

	return ret;
}
