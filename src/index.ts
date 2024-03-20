import { generatorHandler } from "@prisma/generator-helper";
import { writeFile, mkdir, rm, access } from "fs/promises";
import { join } from "path";
import { PlainModel } from "./generator/plainModel";
import { format } from "./util/format";
import { Enum } from "./generator/enum";
import {
  setTypeboxImportDependencyName,
  setTypeboxImportVariableName,
} from "./generator/typeboxImport";
import type { Models } from "./util/modelMap";
import { Compose } from "./generator/composer";
import { RelationModel } from "./generator/relationModel";
import { setAdditionalProperties } from "./generator/documentation";

generatorHandler({
  onManifest() {
    return {
      defaultOutput: "./prismabox",
      prettyName: "Prisma Typebox Generator",
    };
  },
  async onGenerate(options) {
    if (!options.generator.output?.value) {
      throw new Error("Could not find output directory in generator settings");
    }

    const outputDirectory = options.generator.output.value;

    if (options.generator.config?.typeboxImportVariableName) {
      setTypeboxImportVariableName(
        options.generator.config.typeboxImportVariableName as string
      );
    }

    if (options.generator.config?.typeboxImportDependencyName) {
      setTypeboxImportDependencyName(
        options.generator.config.typeboxImportDependencyName as string
      );
    }

    if (options.generator.config?.additionalProperties) {
      setAdditionalProperties(
        options.generator.config.additionalProperties === "true"
      );
    }

    try {
      await access(outputDirectory);
      await rm(outputDirectory, { recursive: true });
    } catch (error) {}

    await mkdir(outputDirectory, { recursive: true });

    const plainTasks: Promise<void>[] = [];
    const plainTypes: Models = new Map<string, string>();

    plainTasks.push(
      ...options.dmmf.datamodel.enums.map(async (e) => {
        plainTypes.set(e.name, Enum(e));
      })
    );

    plainTasks.push(
      ...options.dmmf.datamodel.models.map(async (e) => {
        plainTypes.set(e.name, PlainModel(e));
      })
    );
    await Promise.all(plainTasks);

    const relationTasks: Promise<void>[] = [];
    const relationTypes: Models = new Map<string, string>();

    relationTasks.push(
      ...options.dmmf.datamodel.models.map(async (e) => {
        relationTypes.set(e.name, RelationModel(e, plainTypes));
      })
    );
    await Promise.all(relationTasks);

    for (const [name, content] of plainTypes) {
      const models = new Map<string, string>();
      // join relation types with plain types

      models.set(`${name}Plain`, content);

      const relationTypeForThisName = relationTypes.get(name);
      if (relationTypeForThisName) {
        models.set(`${name}Relation`, relationTypeForThisName);
      }

      await writeFile(
        join(outputDirectory, `${name}.ts`),
        await format(Compose(models))
      );
    }
  },
});
