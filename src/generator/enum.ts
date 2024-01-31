import type { DMMF } from "@prisma/generator-helper";
import { TypeboxImport, typeboxImportVariableName } from "./typeboxImport";
import { textIfTrue } from "../util/wrapped";
import { plainIdentifier, typeIdentifier } from "../util/identifiers";

export function Enum(
	data: Pick<DMMF.DatamodelEnum, "name" | "values" | "documentation">,
) {
	const options = textIfTrue({
		condition: data.documentation !== undefined,
		text: `, {description: "${data.documentation}"}`,
	});

	const variantsString = data.values.map((v) => Variant(v.name)).join(",");

	const typeString = `export type ${data.name}${typeIdentifier} = Static<typeof ${data.name}>;`;

	const plainCompatibilityFiller = `export const ${data.name}${plainIdentifier} = ${data.name};`;

	return {
		str: `export const ${data.name} = ${typeboxImportVariableName}.Union([${variantsString}]${options});${plainCompatibilityFiller}${typeString}`,
		name: data.name,
	};
}

function Variant(identifier: string) {
	return `${typeboxImportVariableName}.Literal('${identifier}')`;
}
