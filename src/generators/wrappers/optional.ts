import { getConfig } from "../../config";

export function wrapWithOptional(input: string) {
	return `${
		getConfig().typeboxImportVariableName
	}.Optional(${input})`;
}
