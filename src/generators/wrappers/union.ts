import { getConfig } from "../../config";
import { generateTypeboxOptions } from "../../annotations/options";

export function makeUnion(
	inputModels: string[],
	options = generateTypeboxOptions(),
) {
	return `${getConfig().typeboxImportVariableName}.Union([${inputModels.join(
		",",
	)}], ${options})\n`;
}
