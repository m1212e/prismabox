import { generatorHandler } from "@prisma/generator-helper";
import { setConfig } from "./config";
import { mkdir, rm, access } from "node:fs/promises";
import { processEnums } from "./generators/enum";
import { write } from "./writer";
import { processPlain } from "./generators/plain";

generatorHandler({
	onManifest() {
		return {
			defaultOutput: "./prismabox",
			prettyName: "prismabox",
		};
	},
	async onGenerate(options) {
		const config = setConfig(options.generator.config);

		try {
			await access(config.output);
			await rm(config.output, { recursive: true });
		} catch (error) {}

		await mkdir(config.output, { recursive: true });

		processEnums(options.dmmf.datamodel.enums);
		processPlain(options.dmmf.datamodel.models);
		await write();
	},
});
