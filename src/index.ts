import { generatorHandler } from "@prisma/generator-helper";
import { getConfig, setConfig } from "./config";
import { mkdir, rm, access } from "node:fs/promises";
import { processEnums } from "./generators/enum";
import { write } from "./writer";
import { processPlain } from "./generators/plain";
import {
	processRelations,
	processRelationsInputCreate,
	processRelationsInputUpdate,
} from "./generators/relations";
import { processPlainInput } from "./generators/plainInput";

generatorHandler({
	onManifest() {
		return {
			defaultOutput: "./prismabox",
			prettyName: "prismabox",
		};
	},
	async onGenerate(options) {
		setConfig({
			...options.generator.config,
			// for some reason, the output is an object with a value key
			output: options.generator.output?.value,
		});

		console.log(getConfig());
		

		try {
			await access(getConfig().output);
			await rm(getConfig().output, { recursive: true });
		} catch (error) {}

		await mkdir(getConfig().output, { recursive: true });

		processEnums(options.dmmf.datamodel.enums);
		processPlain(options.dmmf.datamodel.models);
		processRelations(options.dmmf.datamodel.models);
		if (getConfig().inputModel) {
			processPlainInput(options.dmmf.datamodel.models);
			processRelationsInputCreate(options.dmmf.datamodel.models);
			processRelationsInputUpdate(options.dmmf.datamodel.models);
		}

		await write();
	},
});
