import { getConfig } from "../config";
import { generateTypeboxOptions } from "../annotations/options";

export function makeComposite(inputModelNames: string[]) {
	return `${
		getConfig().typeboxImportVariableName
	}.Composite([${inputModelNames.join(",")}], ${generateTypeboxOptions()})\n`;
}
