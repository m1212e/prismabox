import type { DMMF } from "@prisma/generator-helper";

export type Annotation =
	| { type: "HIDDEN" }
	| { type: "HIDDEN_DATA" }
	| { type: "OPTIONS"; value: string };

export function isHiddenVariant(
	annotation: Annotation,
): annotation is { type: "HIDDEN"; value: number } {
	return annotation.type === "HIDDEN";
}

export function isHiddenDataVariant(
	annotation: Annotation,
): annotation is { type: "HIDDEN_DATA"; value: number } {
	return annotation.type === "HIDDEN_DATA";
}

export function isOptionsVariant(
	annotation: Annotation,
): annotation is { type: "OPTIONS"; value: string } {
	return annotation.type === "OPTIONS";
}

const annotationKeys: { type: Annotation["type"]; keys: string[] }[] = [
	{
		type: "HIDDEN",
		keys: ["@prismabox.hide", "@prismabox.hidden"],
	},
	{
		type: "HIDDEN_DATA",
		keys: ["@prismabox.hide.data", "@prismabox.hidden.data"],
	},
	{
		type: "OPTIONS",
		keys: ["@prismabox.options"],
	},
];

export function extractAnnotations(
	input: DMMF.Model["fields"][number]["documentation"],
): {
	annotations: Annotation[];
	description: string | undefined;
	isHidden: boolean;
	isHiddenData: boolean;
} {
	const annotations: Annotation[] = [];
	let description = "";

	const raw = input ?? "";

	for (const line of raw.split("\n").map((l) => l.trim())) {
		const annotationKey = annotationKeys.find((key) =>
			key.keys.some((k) => line.startsWith(k)),
		);

		if (annotationKey) {
			if (annotationKey.type === "OPTIONS") {
				if (!line.startsWith(`${annotationKey.keys[0]}{`)) {
					throw new Error(
						"Invalid syntax, expected opening { after prismabox.options",
					);
				}
				if (!line.endsWith("}")) {
					throw new Error(
						"Invalid syntax, expected closing } for prismabox.options",
					);
				}

				annotations.push({
					type: "OPTIONS",
					value: line.substring(
						annotationKey.keys[0].length + 1,
						line.length - 1,
					),
				});
			} else {
				annotations.push({ type: annotationKey.type });
			}
		} else {
			description += `${line}\n`;
		}
	}

	description = description.trim();
	return {
		annotations,
		description: description.length > 0 ? description : undefined,
		isHidden: isHidden(annotations),
		isHiddenData: isHiddenData(annotations),
	};
}

export function isHidden(annotations: Annotation[]): boolean {
	return annotations.some((a) => a.type === "HIDDEN");
}

export function isHiddenData(annotations: Annotation[]): boolean {
	return annotations.some((a) => a.type === "HIDDEN");
}
