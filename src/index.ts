import { access, mkdir, rm } from "node:fs/promises";
import { generatorHandler } from "@prisma/generator-helper";
import { getConfig, setConfig } from "./config";
import { processEnums } from "./generators/enum";
import { processPlain } from "./generators/plain";
import { processRelations } from "./generators/relations";
import { processWhere, processWhereUnique } from "./generators/where";
import { write } from "./writer";
import { processPlainInputCreate } from "./generators/plainInputCreate";
import { processPlainInputUpdate } from "./generators/plainInputUpdate";
import { processPlainInputSelect } from "./generators/plainInputSelect";
import { processRelationsInputCreate } from "./generators/relationsInputCreate";
import { processRelationsInputUpdate } from "./generators/relationsInputUpdate";
import { processRelationsInputSelect } from "./generators/relationsInputSelect";
import { processRelationsInputInclude } from "./generators/relationsInputInclude";
import { processPlainInputOrderBy } from "./generators/plainInputOrderBy";
import { processRelationsInputOrderBy } from "./generators/relationsInputOrderBy";

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

    try {
      await access(getConfig().output);
      await rm(getConfig().output, { recursive: true });
    } catch (error) {}

    await mkdir(getConfig().output, { recursive: true });

    processEnums(options.dmmf.datamodel.enums);
    processPlain(options.dmmf.datamodel.models);
    processRelations(options.dmmf.datamodel.models);
    processWhere(options.dmmf.datamodel.models);
    processWhereUnique(options.dmmf.datamodel.models);
    if (getConfig().inputModel) {
      processPlainInputCreate(options.dmmf.datamodel.models);
      processPlainInputUpdate(options.dmmf.datamodel.models);
      processRelationsInputCreate(options.dmmf.datamodel.models);
      processRelationsInputUpdate(options.dmmf.datamodel.models);
    }
    if (getConfig().inputSelect) {
      processPlainInputSelect(options.dmmf.datamodel.models);
      processRelationsInputSelect(options.dmmf.datamodel.models);
    }
    if (getConfig().inputInclude) {
      processRelationsInputInclude(options.dmmf.datamodel.models);
    }
    if (getConfig().inputOrderBy) {
      processPlainInputOrderBy(options.dmmf.datamodel.models);
      processRelationsInputOrderBy(options.dmmf.datamodel.models);
    }

    await write();
  },
});
