import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import {
	Field,
	ReferenceFieldDeep,
	isPrimitivePrismaFieldType,
} from "./field";
import {
	deepIdentifier,
	plainIdentifier,
	referencesIdentifier,
	typeIdentifier,
} from "../util/identifiers";
import { textIfTrue, wrappedIfTrue, type Wrapped } from "../util/wrapped";

export function Model(
	data: Pick<DMMF.Model, "name" | "fields" | "documentation">,
) {
	const fields = data.fields;
	const name = data.name;
	const options = textIfTrue({
		condition: data.documentation !== undefined,
		text: `, {description: "${data.documentation}"}`,
	});

	const referencedModels = data.fields.filter(
		(f) => !isPrimitivePrismaFieldType(f.type),
	);

	const recursive = wrappedIfTrue({
		condition: referencedModels.some((f) => f.type === data.name),
		opener: `${typeboxImportVariableName}.Recursive(This =>`,
		closer: ", { $id: 'Node' })",
	});

	const needsImportsFrom = referencedModels
		.filter((f) => f.type !== data.name)
		.map((f) => f.type);

	const plain = Plain({ fields, name, options });
	const references = References({ fields, name, options, recursive });
	const referencesDeep = ReferencesDeep({ fields, name, options, recursive });
	const modelComposite = `export const ${name} = ${typeboxImportVariableName}.Composite([${name}${plainIdentifier}, ${name}${referencesIdentifier}]); export type ${name}${typeIdentifier} = Static<typeof ${name}${referencesIdentifier}>;`;
	const modelCompositeDeep = `export const ${name}${deepIdentifier} = ${typeboxImportVariableName}.Composite([${name}${plainIdentifier}, ${name}${referencesIdentifier}${deepIdentifier}]); export type ${name}${deepIdentifier}${typeIdentifier} = Static<typeof ${name}${deepIdentifier}>;`;


	return {
		name,
		needsImportsFrom,
		str:
			plain + references + referencesDeep + modelComposite + modelCompositeDeep,
	};
}

function Plain({
	name,
	fields,
	options,
}: {
	fields: DMMF.Model["fields"];
	name: string;
	options: string;
}) {
	const fieldsString = fields
		.filter((f) => isPrimitivePrismaFieldType(f.type))
		.map((f) =>
			Field({
				data: f,
				modelName: name,
			}),
		)
		.reduce((prev, curr) => `${prev + curr},`, "");

	const modelString = `export const ${name}${plainIdentifier} = ${typeboxImportVariableName}.Object({${fieldsString}}${options});`;
	const typeString = `export type ${name}${plainIdentifier}${typeIdentifier} = Static<typeof ${name}${plainIdentifier}>;`;

	return modelString + typeString;
}

function References({
	name,
	fields,
	options,
	recursive,
}: {
	fields: DMMF.Model["fields"];
	name: string;
	options: string;
	recursive: Wrapped;
}) {
	const fieldsString = fields
		.filter((f) => !isPrimitivePrismaFieldType(f.type))
		.map((f) =>
			Field({
				data: f,
				modelName: name,
				deep: false,
			}),
		)
		.reduce((prev, curr) => `${prev + curr},`, "");

	const modelString = `export const ${name}${referencesIdentifier} = ${recursive.opener}${typeboxImportVariableName}.Object({${fieldsString}}${options})${recursive.closer};`;
	const modelType = `export type ${name}${referencesIdentifier}${typeIdentifier} = Static<typeof ${name}${referencesIdentifier}>;`;

	return modelString + modelType;
}

function ReferencesDeep({
	name,
	fields,
	options,
	recursive,
}: {
	fields: DMMF.Model["fields"];
	name: string;
	options: string;
	recursive: Wrapped;
}) {
	const fieldsString = fields
		.filter((f) => !isPrimitivePrismaFieldType(f.type))
		.map((f) =>
			Field({
				data: f,
				modelName: name,
				deep: true,
			}),
		)
		.reduce((prev, curr) => `${prev + curr},`, "");

	const modelString = `export const ${name}${referencesIdentifier}${deepIdentifier} = ${recursive.opener}${typeboxImportVariableName}.Object({${fieldsString}}${options})${recursive.closer};`;
	const modelType = `export type ${name}${referencesIdentifier}${deepIdentifier}${typeIdentifier} = Static<typeof ${name}${referencesIdentifier}${deepIdentifier}>;`;

	return modelString + modelType;
}
