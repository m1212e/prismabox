import { generatorHandler } from "@prisma/generator-helper";
import { writeFile, mkdir, rm, access } from "node:fs/promises";
import { join } from "node:path";
import { PlainModel } from "./generator/plainModel";
import { format } from "./util/format";
import { Enum } from "./generator/enum";
import {
	setTypeboxImportDependencyName,
	setTypeboxImportVariableName,
} from "./generator/typeboxImport";
import { mergeModels, type Models } from "./util/modelMap";
import { Compose } from "./generator/composer";
import { RelationModel } from "./generator/relationModel";
import { setAdditionalProperties } from "./generator/documentation";
import { Composite } from "./generator/composite";
import { WhereModel } from "./generator/whereModel";
import { NullableType } from "./generator/nullable";
import {
	DataModelPlain,
	DataModelPlainOptional,
	DataModelRelations,
	DataModelRelationsOptional,
	enableDataModel,
} from "./generator/dataModel";
import {
	relationsAdditionalFields,
	parseAdditionalFields,
	plainAdditionalFields,
	plainDataAdditionalFields,
	plainDataOptionalAdditionalFields,
	relationsDataAdditionalFields,
	relationsDataOptionalAdditionalFields,
} from "./generator/additionalFields";

generatorHandler({
	onManifest() {
		return {
			defaultOutput: "./prismabox",
			prettyName: "prismabox",
		};
	},
	async onGenerate(options) {
		if (!options.generator.output?.value) {
			throw new Error("Could not find output directory in generator settings");
		}

		const outputDirectory = options.generator.output.value;

		if (options.generator.config?.typeboxImportVariableName) {
			setTypeboxImportVariableName(
				options.generator.config.typeboxImportVariableName as string,
			);
		}

		if (options.generator.config?.typeboxImportDependencyName) {
			setTypeboxImportDependencyName(
				options.generator.config.typeboxImportDependencyName as string,
			);
		}

		if (options.generator.config?.additionalProperties) {
			setAdditionalProperties(
				options.generator.config.additionalProperties === "true",
			);
		}

		if (options.generator.config?.dataModel === "true") {
			enableDataModel();
		}

		parseAdditionalFields(options.generator.config || {});

		try {
			await access(outputDirectory);
			await rm(outputDirectory, { recursive: true });
		} catch (error) {}

		await mkdir(outputDirectory, { recursive: true });

		const plainTasks: Promise<void>[] = [];
		const plainTypes: Models = new Map<string, string>();

		plainTasks.push(
			...options.dmmf.datamodel.models.map(async (e) => {
				const model = PlainModel(e, false, plainAdditionalFields);
				if (model) {
					plainTypes.set(e.name, model);
				}
			}),
		);

		const enumTasks: Promise<void>[] = [];
		const enumTypes: Models = new Map<string, string>();

		enumTasks.push(
			...options.dmmf.datamodel.enums.map(async (e) => {
				const en = Enum(e);
				if (en) {
					enumTypes.set(e.name, en);
				}
			}),
		);

		const whereTasks: Promise<void>[] = [];
		const whereTypes: Models = new Map<string, string>();

		whereTasks.push(
			...options.dmmf.datamodel.models.map(async (e) => {
				const model = WhereModel(e);
				if (model) {
					whereTypes.set(e.name, model);
				}
			}),
		);

		const dataPlainTasks: Promise<void>[] = [];
		const dataPlainTypes: Models = new Map<string, string>();

		dataPlainTasks.push(
			...options.dmmf.datamodel.models.map(async (e) => {
				const model = DataModelPlain(e, enumTypes, plainDataAdditionalFields);
				if (model) {
					dataPlainTypes.set(e.name, model);
				}
			}),
		);

		const optionalDataPlainTasks: Promise<void>[] = [];
		const optionalDataPlainTypes: Models = new Map<string, string>();

		optionalDataPlainTasks.push(
			...options.dmmf.datamodel.models.map(async (e) => {
				const model = DataModelPlainOptional(
					e,
					enumTypes,
					plainDataOptionalAdditionalFields,
				);
				if (model) {
					optionalDataPlainTypes.set(e.name, model);
				}
			}),
		);

		const dataRelationTasks: Promise<void>[] = [];
		const dataRelationTypes: Models = new Map<string, string>();

		dataRelationTasks.push(
			...options.dmmf.datamodel.models.map(async (e) => {
				const model = DataModelRelations(
					e,
					enumTypes,
					relationsDataAdditionalFields,
				);
				if (model) {
					dataRelationTypes.set(e.name, model);
				}
			}),
		);

		const optionalDataRelationTasks: Promise<void>[] = [];
		const optionalDataRelationTypes: Models = new Map<string, string>();

		optionalDataRelationTasks.push(
			...options.dmmf.datamodel.models.map(async (e) => {
				const model = DataModelRelationsOptional(
					e,
					enumTypes,
					relationsDataOptionalAdditionalFields,
				);
				if (model) {
					optionalDataRelationTypes.set(e.name, model);
				}
			}),
		);

		await Promise.all([
			...plainTasks,
			...optionalDataPlainTasks,
			...dataRelationTasks,
			...optionalDataRelationTasks,
			...enumTasks,
		]);

		const relationTasks: Promise<void>[] = [];
		const relationTypes: Models = new Map<string, string>();

		relationTasks.push(
			...options.dmmf.datamodel.models.map(async (e) => {
				const model = RelationModel(
					e,
					mergeModels(plainTypes, enumTypes),
					relationsAdditionalFields,
				);
				if (model) {
					relationTypes.set(e.name, model);
				}
			}),
		);

		await Promise.all([...relationTasks, ...whereTasks, ...dataPlainTasks]);

		await Promise.all([
			...Array.from(plainTypes).map(async ([name, content]) => {
				const models = new Map<string, string>();

				models.set(`${name}Plain`, content);

				const relationTypeForThisName = relationTypes.get(name);
				if (relationTypeForThisName) {
					models.set(`${name}Relations`, relationTypeForThisName);
				}
				// join relation types with plain types
				models.set(name, Composite(models));

				const whereTypeForThisName = whereTypes.get(name);
				if (whereTypeForThisName) {
					models.set(`${name}Where`, whereTypeForThisName);
				}

				const dataModels = new Map<string, string>();
				const dataModelsOptional = new Map<string, string>();

				const dataTypePlainForThisName = dataPlainTypes.get(name);
				if (dataTypePlainForThisName) {
					dataModels.set(`${name}DataPlain`, dataTypePlainForThisName);
				}

				const optionalDataTypePlainForThisName =
					optionalDataPlainTypes.get(name);
				if (optionalDataTypePlainForThisName) {
					dataModelsOptional.set(
						`${name}DataPlainOptional`,
						optionalDataTypePlainForThisName,
					);
				}

				const dataTypeRelationsForThisName = dataRelationTypes.get(name);
				if (dataTypeRelationsForThisName) {
					dataModels.set(`${name}DataRelations`, dataTypeRelationsForThisName);
				}

				const optionalDataRelationsTypeForThisName =
					optionalDataRelationTypes.get(name);
				if (optionalDataRelationsTypeForThisName) {
					dataModelsOptional.set(
						`${name}DataRelationsOptional`,
						optionalDataRelationsTypeForThisName,
					);
				}

				dataModels.set(`${name}Data`, Composite(dataModels));
				dataModelsOptional.set(
					`${name}DataOptional`,
					Composite(dataModelsOptional),
				);

				await writeFile(
					join(outputDirectory, `${name}.ts`),
					await format(
						Compose(mergeModels(models, dataModels, dataModelsOptional)),
					),
				);
			}),
			...Array.from(enumTypes).map(async (p) => {
				await writeFile(
					join(outputDirectory, `${p[0]}.ts`),
					await format(Compose(new Map([p]))),
				);
			}),
		]);

		await writeFile(
			join(outputDirectory, "__nullable__.ts"),
			await format(NullableType()),
		);
	},
});
