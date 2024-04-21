import type { DMMF, Dictionary } from "@prisma/generator-helper";

export const plainAdditionalFields: DMMF.Model["fields"][number][] = [];
export const relationsAdditionalFields: DMMF.Model["fields"][number][] = [];
export const plainDataAdditionalFields: DMMF.Model["fields"][number][] = [];
export const relationsDataAdditionalFields: DMMF.Model["fields"][number][] = [];
export const plainDataOptionalAdditionalFields: DMMF.Model["fields"][number][] =
	[];
export const relationsDataOptionalAdditionalFields: DMMF.Model["fields"][number][] =
	[];

export function parseAdditionalFields(config: Dictionary<string | string[]>) {
	if (config.plainAdditionalFields) {
		const fields = parseFields(
			typeof config.plainAdditionalFields === "string"
				? [config.plainAdditionalFields]
				: config.plainAdditionalFields,
		);
		plainAdditionalFields.push(...fields);
	}

	if (config.relationsAdditionalFields) {
		const fields = parseFields(
			typeof config.relationsAdditionalFields === "string"
				? [config.relationsAdditionalFields]
				: config.relationsAdditionalFields,
		);
		relationsAdditionalFields.push(...fields);
	}

	if (config.plainDataAdditionalFields) {
		const fields = parseFields(
			typeof config.plainDataAdditionalFields === "string"
				? [config.plainDataAdditionalFields]
				: config.plainDataAdditionalFields,
		);
		plainDataAdditionalFields.push(...fields);
	}

	if (config.relationsDataAdditionalFields) {
		const fields = parseFields(
			typeof config.relationsDataAdditionalFields === "string"
				? [config.relationsDataAdditionalFields]
				: config.relationsDataAdditionalFields,
		);
		relationsDataAdditionalFields.push(...fields);
	}

	if (config.plainDataOptionalAdditionalFields) {
		const fields = parseFields(
			typeof config.plainDataOptionalAdditionalFields === "string"
				? [config.plainDataOptionalAdditionalFields]
				: config.plainDataOptionalAdditionalFields,
		);
		plainDataOptionalAdditionalFields.push(...fields);
	}

	if (config.relationsDataOptionalAdditionalFields) {
		const fields = parseFields(
			typeof config.relationsDataOptionalAdditionalFields === "string"
				? [config.relationsDataOptionalAdditionalFields]
				: config.relationsDataOptionalAdditionalFields,
		);
		relationsDataOptionalAdditionalFields.push(...fields);
	}
}

function parseFields(strings: string[]): DMMF.Model["fields"][number][] {
	return strings.map((field) => {
		let [name, fieldType] = field.split(":").map((s) => s.trim());
		let isRequired = true;
		if (name.endsWith("?")) {
			name = name.slice(0, name.length - 1);
			isRequired = false;
		}

		let isList = false;
		if (name.endsWith("[]")) {
			name = name.slice(0, name.length - 2);
			isList = true;
		}
		return {
			hasDefaultValue: false,
			isGenerated: false,
			isId: false,
			isList,
			isReadOnly: false,
			isRequired,
			isUnique: false,
			name,
			kind: "scalar",
			type: fieldType,
		};
	});
}
