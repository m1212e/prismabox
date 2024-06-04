import { getConfig } from "./config";
import { processedEnums } from "./generators/enum";
import { nullableImport, nullableType } from "./generators/nullable";
import { processedPlain } from "./generators/plain";

export type ProcessedModel = {
	name: string;
	stringRepresentation: string;
	needsNullableImport: boolean;
};

function convertProcessedModelToStandaloneString(input: ProcessedModel) {
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
		{
			stringRepresentation: ProcessedModel["stringRepresentation"];
			needsNullableImport: boolean;
		}
	>();

	const process = (models: ProcessedModel[], suffix: string) => {
		for (const processedModel of models) {
			if (processedModel.needsNullableImport) {
				generateNullableOutput = true;
			}
			const standalone = convertProcessedModelToStandaloneString({
				...processedModel,
				name: `${processedModel.name}${suffix}`,
			});
			const current = modelsPerName.get(processedModel.name);
			if (current) {
				modelsPerName.set(processedModel.name, {
					stringRepresentation: `${current.stringRepresentation}\n${standalone}`,
					needsNullableImport:
						current.needsNullableImport || processedModel.needsNullableImport,
				});
			} else {
				modelsPerName.set(processedModel.name, {
					stringRepresentation: standalone,
					needsNullableImport: processedModel.needsNullableImport,
				});
			}
		}
	};

	let generateNullableOutput = false;
	process(processedEnums, "");
	process(processedPlain, "Plain");

	for (const [key, value] of modelsPerName) {
		if (value.needsNullableImport) {
			modelsPerName.set(key, {
				...value,
				stringRepresentation: `${nullableImport()}\n${
					value.stringRepresentation
				}`,
			});
		}
	}
	for (const [key, value] of modelsPerName) {
		modelsPerName.set(key, {
			...value,
			stringRepresentation: `${typepoxImportStatement()}\n${
				value.stringRepresentation
			}`,
		});
	}

	if (generateNullableOutput) {
		modelsPerName.set(getConfig().nullableName, {
			stringRepresentation: nullableType(),
			needsNullableImport: false,
		});
	}

	return modelsPerName;
}
