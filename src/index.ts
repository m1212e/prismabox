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
import { Composite } from "./generator/composite";

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
        const en = Enum(e);
        if (en) {
          plainTypes.set(e.name, en);
        }
      })
    );

    plainTasks.push(
      ...options.dmmf.datamodel.models.map(async (e) => {
        const model = PlainModel(e);
        if (model) {
          plainTypes.set(e.name, model);
        }
      })
    );
    await Promise.all(plainTasks);

    const relationTasks: Promise<void>[] = [];
    const relationTypes: Models = new Map<string, string>();

    relationTasks.push(
      ...options.dmmf.datamodel.models.map(async (e) => {
        const model = RelationModel(e, plainTypes);
        if (model) {
          relationTypes.set(e.name, model);
        }
      })
    );
    await Promise.all(relationTasks);

    for (const [name, content] of plainTypes) {
      const models = new Map<string, string>();
      // join relation types with plain types

      models.set(`${name}Plain`, content);

      const relationTypeForThisName = relationTypes.get(name);
      if (relationTypeForThisName) {
        models.set(`${name}Relations`, relationTypeForThisName);
      }

      models.set(name, Composite(models));

      await writeFile(
        join(outputDirectory, `${name}.ts`),
        await format(Compose(models))
      );
    }
  },
});
