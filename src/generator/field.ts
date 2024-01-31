import type { DMMF } from "@prisma/generator-helper";
import type { Model } from "./model";
import { typeboxImportVariableName } from "./typeboxImport";
import { deepIdentifier, plainIdentifier } from "../util/identifiers";
import { wrappedIfTrue, type Wrapped } from "../util/wrapped";
import { Decorator, parseDocumentation } from "./documentation";

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
	const optional = wrappedIfTrue({
		condition: !data.isRequired,
		opener: `${typeboxImportVariableName}.Optional(`,
		closer: ")",
	});

	const list = wrappedIfTrue({
		condition: data.isList,
		opener: `${typeboxImportVariableName}.Array(`,
		closer: ")",
	});

	const parsedDocumentation = parseDocumentation(data.documentation);
	if (parsedDocumentation.decorators.includes(Decorator.HIDDEN)) return undefined;


	const name = data.name;
	const fieldType = data.type;
	if (isPrimitivePrismaFieldType(fieldType)) {
		return PrimitiveField({
			name,
			fieldType,
			options: parsedDocumentation.options,
			optional,
			list,
		});
	}

	if (deep) {
		return ReferenceFieldDeep({
			name,
			fieldType,
			list,
			modelName,
			optional,
		});
	}
	return ReferenceField({
		name,
		fieldType,
		list,
		modelName,
		optional,
	});
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
	optional: Wrapped;
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

	return `${name}: ${optional.opener}${list.opener}${type}${list.closer}${optional.closer}`;
}

function ReferenceField({
	name,
	modelName,
	fieldType,
	optional,
	list,
}: {
	fieldType: string;
	name: string;
	modelName: string;
	optional: Wrapped;
	list: Wrapped;
}) {
	let type: string;
	if (name === modelName) {
		type = "This";
	} else {
		type = fieldType + plainIdentifier;
	}

	return `${name}: ${optional.opener}${list.opener}${type}${list.closer}${optional.closer}`;
}

export function ReferenceFieldDeep({
	name,
	modelName,
	fieldType,
	optional,
	list,
}: {
	fieldType: string;
	name: string;
	modelName: string;
	optional: Wrapped;
	list: Wrapped;
}) {
	let type: string;
	if (name === modelName) {
		type = "This";
	} else {
		type = fieldType;
	}

	return `${name}: ${optional.opener}${list.opener}${type}${list.closer}${optional.closer}`;
}
