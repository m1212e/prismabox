import type { DMMF } from "@prisma/generator-helper";
import type { Model } from "./model";
import { typeboxImportVariableName } from "./typeboxImport";
import { deepIdentifier, plainIdentifier } from "../util/identifiers";
import { textIfTrue, wrappedIfTrue, type Wrapped } from "../util/wrapped";

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

export function Field({
	data,
	deep = false,
	modelName,
}: {
	data: Pick<
		DMMF.Model["fields"][number],
		"name" | "documentation" | "isRequired" | "isList" | "type"
	>;
	deep?: boolean;
	modelName: string;
}) {
	const required = wrappedIfTrue({
		condition: data.isRequired,
		opener: `${typeboxImportVariableName}.Optional(`,
		closer: ")",
	});

	const list = wrappedIfTrue({
		condition: data.isList,
		opener: `${typeboxImportVariableName}.Array(`,
		closer: ")",
	});

	const options = textIfTrue({
		condition: data.documentation !== undefined,
		text: `{description: "${data.documentation}"}`,
	});

	const name = data.name;
	const fieldType = data.type;
	if (isPrimitivePrismaFieldType(fieldType)) {
		return PrimitiveField({ name, fieldType, options, required, list });
	}

	if (deep) {
		return ReferenceFieldDeep({
			name,
			fieldType,
			list,
			modelName,
			required,
		});
	}
	return ReferenceField({
		name,
		fieldType,
		list,
		modelName,
		required,
	});
}

function PrimitiveField({
	name,
	fieldType,
	options,
	required,
	list,
}: {
	fieldType: PrimitivePrismaFieldType;
	options: string;
	name: string;
	required: Wrapped;
	list: Wrapped;
}) {
	let type: string;
	if (["Int", "BigInt"].includes(fieldType)) {
		type = `${typeboxImportVariableName}.Integer(${options})`;
	} else if (["Float", "Decimal"].includes(fieldType)) {
		type = `${typeboxImportVariableName}.Number(${options})`;
	} else if (fieldType === "String") {
		type = `${typeboxImportVariableName}.String(${options})`;
	} else if (["DateTime", "Date"].includes(fieldType)) {
		type = `${typeboxImportVariableName}.Date(${options})`;
	} else if (fieldType === "Json") {
		type = `${typeboxImportVariableName}.Any(${options})`;
	} else if (fieldType === "Boolean") {
		type = `${typeboxImportVariableName}.Boolean(${options})`;
	} else throw new Error("Invalid type for primitive generation");

	return `${name}: ${required.opener}${list.opener}${type}${list.closer}${required.closer}`;
}

function ReferenceField({
	name,
	modelName,
	fieldType,
	required,
	list,
}: {
	fieldType: string;
	name: string;
	modelName: string;
	required: Wrapped;
	list: Wrapped;
}) {
	let type: string;
	if (name === modelName) {
		type = "This";
	} else {
		type = fieldType + plainIdentifier;
	}

	return `${name}: ${required.opener}${list.opener}${type}${list.closer}${required.closer}`;
}

export function ReferenceFieldDeep({
	name,
	modelName,
	fieldType,
	required,
	list,
}: {
	fieldType: string;
	name: string;
	modelName: string;
	required: Wrapped;
	list: Wrapped;
}) {
	let type: string;
	if (name === modelName) {
		type = "This";
	} else {
		type = fieldType;
	}

	return `${name}: ${required.opener}${list.opener}${type}${list.closer}${required.closer}`;
}
