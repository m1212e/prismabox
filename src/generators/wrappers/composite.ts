import { getConfig } from "../../config";
import { generateTypeboxOptions } from "../../annotations/options";

export function makeComposite(inputModels: string[]) {
	return `${
		getConfig().typeboxImportVariableName
	}.Composite([${inputModels.join(",")}], ${generateTypeboxOptions()})\n`;
}
