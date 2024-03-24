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
import { mergeModels, type Models } from "./util/modelMap";
import { Compose } from "./generator/composer";
import { RelationModel } from "./generator/relationModel";
import { setAdditionalProperties } from "./generator/documentation";
import { Composite } from "./generator/composite";
import { WhereModel } from "./generator/whereModel";
import { Nullable } from "./generator/nullable";

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
      ...options.dmmf.datamodel.models.map(async (e) => {
        const model = PlainModel(e);
        if (model) {
          plainTypes.set(e.name, model);
        }
      })
    );

    const enumTasks: Promise<void>[] = [];
    const enumTypes: Models = new Map<string, string>();

    enumTasks.push(
      ...options.dmmf.datamodel.enums.map(async (e) => {
        const en = Enum(e);
        if (en) {
          enumTypes.set(e.name, en);
        }
      })
    );

    const whereTasks: Promise<void>[] = [];
    const whereTypes: Models = new Map<string, string>();

    whereTasks.push(
      ...options.dmmf.datamodel.models.map(async (e) => {
        const model = WhereModel(e);
        if (model) {
          whereTypes.set(e.name, model);
        }
      })
    );

    await Promise.all([...plainTasks, ...enumTasks]);

    const relationTasks: Promise<void>[] = [];
    const relationTypes: Models = new Map<string, string>();

    relationTasks.push(
      ...options.dmmf.datamodel.models.map(async (e) => {
        const model = RelationModel(e, mergeModels(plainTypes, enumTypes));
        if (model) {
          relationTypes.set(e.name, model);
        }
      })
    );
    await Promise.all([...relationTasks, ...whereTasks]);

    await Promise.all([
      ...Array.from(plainTypes).map(async ([name, content]) => {
        const models = new Map<string, string>();
        // join relation types with plain types

        models.set(`${name}Plain`, content);

        const relationTypeForThisName = relationTypes.get(name);
        if (relationTypeForThisName) {
          models.set(`${name}Relations`, relationTypeForThisName);
        }
        models.set(name, Composite(models));

        const whereTypeForThisName = whereTypes.get(name);
        if (whereTypeForThisName) {
          models.set(`${name}Where`, whereTypeForThisName);
        }

        await writeFile(
          join(outputDirectory, `${name}.ts`),
          await format(Compose(models))
        );
      }),
      ...Array.from(enumTypes).map(async (p) => {
        await writeFile(
          join(outputDirectory, `${p[0]}.ts`),
          await format(Compose(new Map([p])))
        );
      }),
    ]);

    await writeFile(
      join(outputDirectory, "__nullable__.ts"),
      await format(Nullable())
    );
  },
});
