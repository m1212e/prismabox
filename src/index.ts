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
import { processPlainSelect } from "./generators/plainInputSelect";
import { processRelationsInputCreate } from "./generators/relationsInputCreate";
import { processRelationsInputUpdate } from "./generators/relationsInputUpdate";
import { processRelationsSelect } from "./generators/relationsInputSelect";
import { processRelationsInclude as processRelationInclude } from "./generators/relationsInputInclude";
import { processPlainOrderBy } from "./generators/plainInputOrderBy";
import { processRelationsOrderBy } from "./generators/relationsInputOrderBy";

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
    if (getConfig().selectModel) {
      processPlainSelect(options.dmmf.datamodel.models);
      processRelationsSelect(options.dmmf.datamodel.models);
    }
    if (getConfig().includeModel) {
      processRelationInclude(options.dmmf.datamodel.models);
    }
    if (getConfig().orderByModel) {
      processPlainOrderBy(options.dmmf.datamodel.models);
      processRelationsOrderBy(options.dmmf.datamodel.models);
    }

    await write();
  },
});
