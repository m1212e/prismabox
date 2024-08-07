import { access, mkdir, rm } from "node:fs/promises";
import { generatorHandler } from "@prisma/generator-helper";
import { getConfig, setConfig } from "./config";
import { processEnums } from "./generators/enum";
import { processPlain } from "./generators/plain";
import { processPlainInput } from "./generators/plainInput";
import {
  processRelations,
  processRelationsInputCreate,
  processRelationsInputUpdate,
} from "./generators/relations";
import { processWhere, processWhereUnique } from "./generators/where";
import { write } from "./writer";

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
      processPlainInput(options.dmmf.datamodel.models);
      processRelationsInputCreate(options.dmmf.datamodel.models);
      processRelationsInputUpdate(options.dmmf.datamodel.models);
    }

    await write();
  },
});
