import type { DMMF } from "@prisma/generator-helper";
import { typeboxImportVariableName } from "./typeboxImport";
import { Field, isPrimitivePrismaFieldType } from "./field";
import {
	deepIdentifier,
	plainIdentifier,
	referencesIdentifier,
	typeIdentifier,
	uniqueIdentifier,
} from "../util/identifiers";
import { wrappedIfTrue, type Wrapped } from "../util/wrapped";
import { Decorator, parseDocumentation } from "./documentation";

export function Model(
	data: Pick<DMMF.Model, "name" | "fields" | "documentation">,
) {
	const fields = data.fields;
	const name = data.name;
	const parsedDocumentation = parseDocumentation(data.documentation);
	if (parsedDocumentation.decorators.includes(Decorator.HIDDEN))
		return {
			name,
			needsImportsFrom: [],
			str: "\n\n// prismabox has hidden this schema",
		};

	const referencedModels = data.fields.filter(
		(f) => !isPrimitivePrismaFieldType(f.type),
	);

	const recursive = wrappedIfTrue({
		condition: referencedModels.some((f) => f.type === data.name),
		opener: `${typeboxImportVariableName}.Recursive(This =>`,
		closer: ", { $id: 'Node' })",
	});

	const plain = Plain({ fields, name, options: parsedDocumentation.options });
	const references = References({
		fields,
		name,
		options: parsedDocumentation.options,
		recursive,
	});
	const referencesDeep = ReferencesDeep({
		fields,
		name,
		options: parsedDocumentation.options,
		recursive,
	});
	const unique = Unique({
		fields,
		name,
	});
	const modelComposite = `export const ${name} = ${typeboxImportVariableName}.Composite([${name}${plainIdentifier}, ${name}${referencesIdentifier}]); export type ${name}${typeIdentifier} = Static<typeof ${name}${referencesIdentifier}>;`;
	const modelCompositeDeep = `export const ${name}${deepIdentifier} = ${typeboxImportVariableName}.Composite([${name}${plainIdentifier}, ${name}${referencesIdentifier}${deepIdentifier}]); export type ${name}${deepIdentifier}${typeIdentifier} = Static<typeof ${name}${deepIdentifier}>;`;

	const needsImportsFrom = Array.from(
		new Set([...references.references, ...referencesDeep.references]).values(),
	)
		.filter((f) => f.type !== data.name)
		.map((f) => f.type);

	return {
		name,
		needsImportsFrom,
		str:
			plain +
			references.str +
			referencesDeep.str +
			unique +
			modelComposite +
			modelCompositeDeep,
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
		.filter((f) => f)
		.join(",");

	const modelString = `export const ${name}${plainIdentifier} = ${typeboxImportVariableName}.Object({${fieldsString}},${options});`;
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
	const results = fields
		.filter((f) => !isPrimitivePrismaFieldType(f.type))
		.map((f) => ({
			str: Field({
				data: f,
				modelName: name,
				deep: false,
			}),
			field: f,
		}))
		.filter((f) => f.str);

	const fieldsString = results.map((r) => r.str).join(",");

	const modelString = `export const ${name}${referencesIdentifier} = ${recursive.opener}${typeboxImportVariableName}.Object({${fieldsString}},${options})${recursive.closer};`;
	const modelType = `export type ${name}${referencesIdentifier}${typeIdentifier} = Static<typeof ${name}${referencesIdentifier}>;`;

	return {
		str: modelString + modelType,
		references: results.map((r) => r.field),
	};
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
	const results = fields
		.filter((f) => !isPrimitivePrismaFieldType(f.type))
		.map((f) => ({
			str: Field({
				data: f,
				modelName: name,
				deep: true,
			}),
			field: f,
		}))
		.filter((f) => f.str);

	const fieldsString = results.map((r) => r.str).join(",");

	const modelString = `export const ${name}${referencesIdentifier}${deepIdentifier} = ${recursive.opener}${typeboxImportVariableName}.Object({${fieldsString}},${options})${recursive.closer};`;
	const modelType = `export type ${name}${referencesIdentifier}${deepIdentifier}${typeIdentifier} = Static<typeof ${name}${referencesIdentifier}${deepIdentifier}>;`;

	return {
		str: modelString + modelType,
		references: results.map((r) => r.field),
	};
}

function Unique({
	name,
	fields,
}: {
	fields: DMMF.Model["fields"];
	name: string;
}) {
	const fieldsString = fields
		.filter((f) => f.isUnique || f.isId)
		.map((f) =>
			Field({
				data: f,
				modelName: name,
			}),
		)
		.filter((f) => f)
		.join(",");

	const modelString = `export const ${name}${uniqueIdentifier} = ${typeboxImportVariableName}.Object({${fieldsString}});`;
	const modelType = `export type ${name}${uniqueIdentifier}${typeIdentifier} = Static<typeof ${name}${uniqueIdentifier}>;`;

	return modelString + modelType;
}
