import type { DMMF } from "@prisma/generator-helper";
import { TypeboxImport, typeboxImportVariableName } from "./typeboxImport";
import { plainIdentifier, typeIdentifier } from "../util/identifiers";
import { Decorator, parseDocumentation } from "./documentation";

export function Enum(
	data: Pick<DMMF.DatamodelEnum, "name" | "values" | "documentation">,
) {
	const parsedDocumentation = parseDocumentation(data.documentation);
	const variantsString = data.values.map((v) => Variant(v.name)).join(",");

	if (parsedDocumentation.decorators.includes(Decorator.HIDDEN))
		return {
			str: "\n\n// prismabox has hidden this schema",
			name: data.name,
		};

	const typeString = `export type ${data.name}${typeIdentifier} = Static<typeof ${data.name}>;`;

	const plainCompatibilityFiller = `export const ${data.name}${plainIdentifier} = ${data.name};`;

	return {
		str: `export const ${data.name} = ${typeboxImportVariableName}.Union([${variantsString}],${parsedDocumentation.options});${plainCompatibilityFiller}${typeString}`,
		name: data.name,
	};
}

function Variant(identifier: string) {
	return `${typeboxImportVariableName}.Literal('${identifier}')`;
}
