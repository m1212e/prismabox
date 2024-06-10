import { generateTypeboxOptions } from "../../annotations/options";
import { getConfig } from "../../config";

export function wrapWithArray(input: string) {
	return `${
		getConfig().typeboxImportVariableName
	}.Array(${input}, ${generateTypeboxOptions()})`;
}
