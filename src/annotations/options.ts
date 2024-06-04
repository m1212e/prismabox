import { getConfig } from "../config";
import { isOptionsVariant, type extractAnnotations } from "./annotations";

export function generateTypeboxOptions(
	input: ReturnType<typeof extractAnnotations>,
): string {
	const stringifiedOptions: string[] = [];
	for (const annotation of input.annotations) {
		if (isOptionsVariant(annotation)) {
			stringifiedOptions.push(annotation.value);
		}
	}

	if (getConfig().additionalProperties) {
		stringifiedOptions.push("additionalProperties: true");
	}

	if (input.description) {
		stringifiedOptions.push(`description: \`${input.description}\``);
	}

	return stringifiedOptions.length > 0 ? `{${stringifiedOptions.join(",")}}` : "";
}
