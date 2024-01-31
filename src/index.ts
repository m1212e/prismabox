import { generatorHandler } from "@prisma/generator-helper";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { Model } from "./generator/model";
import { exists } from "@prisma/sdk/dist/utils/tryLoadEnvs";
import { format } from "./util/format";
import { TypeboxImport } from "./generator/typeboxImport";
import { ModelImports } from "./generator/modelImport";

generatorHandler({
	onManifest() {
		return {
			defaultOutput: "./typebox",
			prettyName: "Prisma Typebox Generator",
		};
	},
	async onGenerate(options) {
		if (!options.generator.output?.value) {
			throw new Error("Could not find output directory in generator settings");
		}

		const outputDirectory = options.generator.output.value;

		if (await exists(outputDirectory)) {
			await rm(outputDirectory, { recursive: true });
		}

		await mkdir(outputDirectory, { recursive: true });

		const tasks: Promise<void>[] = [];

		// tasks.push(
		// 	...options.dmmf.datamodel.enums.map(async (e) => {
		// 		const enumC = new Enum(e);
		// 		const stringified = `${new TypeboxImport().stringify()}${enumC.stringify()}`;
		// 		const formatted = await format(stringified);
		// 		await writeFile(join(outputDirectory, `${enumC.name}.ts`), formatted);
		// 	}),
		// );

		tasks.push(
			...options.dmmf.datamodel.models.map(async (e) => {
				const model = Model(e);
				console.log(model.str);
				
				const stringified = `${TypeboxImport()}${ModelImports(
					model.needsImportsFrom,
				)}${model.str}`;
				const formatted = await format(stringified);
				await writeFile(join(outputDirectory, `${model.name}.ts`), formatted);
			}),
		);

		await Promise.all(tasks);
	},
});
