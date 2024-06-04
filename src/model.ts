import { getConfig } from "./config";
import { makeComposite } from "./generators/composite";
import { processedEnums } from "./generators/enum";
import { nullableImport, nullableType } from "./generators/nullable";
import { processedPlain } from "./generators/plain";
import { processedPlainInput } from "./generators/plainInput";
import {
	processedRelations,
	processedRelationsInputCreate,
	processedRelationsInputUpdate,
} from "./generators/relations";

export type ProcessedModel = {
	name: string;
	stringRepresentation: string;
};

function convertModelToStandalone(
	input: Pick<ProcessedModel, "name" | "stringRepresentation">,
) {
	return `export const ${input.name} = ${input.stringRepresentation}\n`;
}

function typepoxImportStatement() {
	return `import { ${getConfig().typeboxImportVariableName} } from "${
		getConfig().typeboxImportDependencyName
	}"\n`;
}

export function mapAllModelsForWrite() {
	const modelsPerName = new Map<
		ProcessedModel["name"],
		ProcessedModel["stringRepresentation"]
	>();

	const process = (models: ProcessedModel[], suffix: string) => {
		for (const processedModel of models) {
			const standalone = convertModelToStandalone({
				...processedModel,
				name: `${processedModel.name}${suffix}`,
			});
			const current = modelsPerName.get(processedModel.name);
			if (current) {
				modelsPerName.set(processedModel.name, `${current}\n${standalone}`);
			} else {
				modelsPerName.set(processedModel.name, standalone);
			}
		}
	};

	process(processedEnums, "");
	process(processedPlain, "Plain");
	process(processedRelations, "Relations");
	process(processedPlainInput, "PlainInput");
	process(processedRelationsInputCreate, "RelationsInputCreate");
	process(processedRelationsInputUpdate, "RelationsInputUpdate");

	for (const [key, value] of modelsPerName) {
		const plain = processedPlain.find((e) => e.name === key);
		const relations = processedRelations.find((e) => e.name === key);
		let composite: string;
		if (plain && relations) {
			composite = makeComposite([`${key}Plain`, `${key}Relations`]);
		} else if (plain) {
			composite = `${key}Plain`;
		} else if (relations) {
			composite = `${key}Relations`;
		} else {
			continue;
		}

		modelsPerName.set(
			key,
			`${value}\n${convertModelToStandalone({
				name: key,
				stringRepresentation: composite,
			})}`,
		);
	}

	for (const [key, value] of modelsPerName) {
		const create = processedRelationsInputCreate.find((e) => e.name === key);

		if (create) {
			const composite = makeComposite([
				`${key}PlainInput`,
				`${key}RelationsInputCreate`,
			]);
			modelsPerName.set(
				key,
				`${value}\n${convertModelToStandalone({
					name: `${key}InputCreate`,
					stringRepresentation: composite,
				})}`,
			);
		}
	}

	for (const [key, value] of modelsPerName) {
		const update = processedRelationsInputUpdate.find((e) => e.name === key);

		if (update) {
			const composite = makeComposite([
				`${key}PlainInput`,
				`${key}RelationsInputUpdate`,
			]);
			modelsPerName.set(
				key,
				`${value}\n${convertModelToStandalone({
					name: `${key}InputUpdate`,
					stringRepresentation: composite,
				})}`,
			);
		}
	}

	for (const [key, value] of modelsPerName) {
		modelsPerName.set(
			key,
			`${typepoxImportStatement()}\n${nullableImport()}\n${value}`,
		);
	}

	modelsPerName.set(getConfig().nullableName, nullableType());

	return modelsPerName;
}
