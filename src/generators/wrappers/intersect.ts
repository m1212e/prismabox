import { getConfig } from "../../config";
import { generateTypeboxOptions } from "../../annotations/options";

export function makeIntersection(
	inputModels: string[],
	options = generateTypeboxOptions(),
) {
	return `${getConfig().typeboxImportVariableName}.Intersect([${inputModels.join(
		",",
	)}], ${options})\n`;
}
