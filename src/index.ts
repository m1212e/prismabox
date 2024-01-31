import { generatorHandler } from "@prisma/generator-helper";
import { writeFile, mkdir, rm, access } from "fs/promises";
import { join } from "path";
import { Model } from "./generator/model";
import { format } from "./util/format";
import { TypeboxImport } from "./generator/typeboxImport";
import { ModelImports } from "./generator/modelImport";
import { Enum } from "./generator/enum";

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

		try {
			await access(outputDirectory);
			await rm(outputDirectory, { recursive: true });
		} catch (error) {}

		await mkdir(outputDirectory, { recursive: true });

		const tasks: Promise<void>[] = [];

		tasks.push(
			...options.dmmf.datamodel.enums.map(async (e) => {
				const enumC = Enum(e);
				const stringified = `${TypeboxImport()}${enumC.str}`;
				const formatted = await format(stringified);
				await writeFile(join(outputDirectory, `${enumC.name}.ts`), formatted);
			}),
		);

		tasks.push(
			...options.dmmf.datamodel.models.map(async (e) => {
				const model = Model(e);
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
