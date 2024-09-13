import { getConfig } from "./config";
import { processedEnums } from "./generators/enum";
import { processedPlain } from "./generators/plain";
import { processedPlainInputCreate } from "./generators/plainInputCreate";
import { processedPlainInputOrderBy } from "./generators/plainInputOrderBy";
import { processedPlainInputSelect } from "./generators/plainInputSelect";
import { processedPlainInputUpdate } from "./generators/plainInputUpdate";
import { processedRelations } from "./generators/relations";
import { processedRelationsInputCreate } from "./generators/relationsInputCreate";
import { processedRelationsInputInclude } from "./generators/relationsInputInclude";
import { processedRelationsInputOrderBy } from "./generators/relationsInputOrderBy";
import { processedRelationsInputSelect } from "./generators/relationsInputSelect";
import { processedRelationsInputUpdate } from "./generators/relationsInputUpdate";
import { processedWhere, processedWhereUnique } from "./generators/where";
import { makeComposite } from "./generators/wrappers/composite";
import { nullableImport, nullableType } from "./generators/wrappers/nullable";

export type ProcessedModel = {
  name: string;
  stringRepresentation: string;
};

function convertModelToStandalone(
  input: Pick<ProcessedModel, "name" | "stringRepresentation">
) {
  return `export const ${input.name} = ${input.stringRepresentation}\n`;
}

function typepoxImportStatement() {
  return `import { ${getConfig().typeboxImportVariableName} } from "${
    getConfig().typeboxImportDependencyName
  }"\n`;
}

export function mapAllModelsForWrite() {
  const modelsPerName = new Map<
    ProcessedModel["name"],
    ProcessedModel["stringRepresentation"]
  >();

  const process = (models: ProcessedModel[], suffix: string) => {
    for (const processedModel of models) {
      const standalone = convertModelToStandalone({
        ...processedModel,
        name: `${processedModel.name}${suffix}`,
      });
      const current = modelsPerName.get(processedModel.name);
      if (current) {
        modelsPerName.set(processedModel.name, `${current}\n${standalone}`);
      } else {
        modelsPerName.set(processedModel.name, standalone);
      }
    }
  };

  process(processedEnums, "");
  process(processedPlain, "Plain");
  process(processedRelations, "Relations");
  process(processedPlainInputCreate, "PlainInputCreate");
  process(processedPlainInputUpdate, "PlainInputUpdate");
  process(processedPlainInputSelect, "PlainInputSelect");
  process(processedPlainInputOrderBy, "PlainInputOrderBy");
  process(processedRelationsInputCreate, "RelationsInputCreate");
  process(processedRelationsInputUpdate, "RelationsInputUpdate");
  process(processedRelationsInputSelect, "RelationsInputSelect");
  process(processedRelationsInputInclude, "RelationsInputInclude");
  process(processedRelationsInputOrderBy, "RelationsInputOrderBy");
  process(processedWhere, "Where");
  process(processedWhereUnique, "WhereUnique");

  for (const [key, value] of modelsPerName) {
    const plain = processedPlain.find((e) => e.name === key);
    const relations = processedRelations.find((e) => e.name === key);
    let composite: string;
    if (plain && relations) {
      composite = makeComposite([`${key}Plain`, `${key}Relations`]);
    } else if (plain) {
      composite = `${key}Plain`;
    } else if (relations) {
      composite = `${key}Relations`;
    } else {
      continue;
    }

    modelsPerName.set(
      key,
      `${value}\n${convertModelToStandalone({
        name: key,
        stringRepresentation: composite,
      })}`
    );
  }

  for (const [key, value] of modelsPerName) {
    const plain = processedPlainInputSelect.find((e) => e.name === key);
    const relations = processedRelationsInputSelect.find((e) => e.name === key);
    let composite: string;
    if (plain && relations) {
      composite = makeComposite([
        `${key}PlainInputSelect`,
        `${key}RelationsInputSelect`,
      ]);
    } else if (plain) {
      composite = `${key}PlainInputSelect`;
    } else if (relations) {
      composite = `${key}RelationsInputSelect`;
    } else {
      continue;
    }

    modelsPerName.set(
      key,
      `${value}\n${convertModelToStandalone({
        name: `${key}InputSelect`,
        stringRepresentation: composite,
      })}`
    );
  }

  for (const [key, value] of modelsPerName) {
    const plain = processedPlainInputOrderBy.find((e) => e.name === key);
    const relations = processedRelationsInputOrderBy.find(
      (e) => e.name === key
    );
    let composite: string;
    if (plain && relations) {
      composite = makeComposite([
        `${key}PlainInputOrderBy`,
        `${key}RelationsInputOrderBy`,
      ]);
    } else if (plain) {
      composite = `${key}PlainInputOrderBy`;
    } else if (relations) {
      composite = `${key}RelationsInputOrderBy`;
    } else {
      continue;
    }

    modelsPerName.set(
      key,
      `${value}\n${convertModelToStandalone({
        name: `${key}InputOrderBy`,
        stringRepresentation: composite,
      })}`
    );
  }

  for (const [key, value] of modelsPerName) {
    const relations = processedRelationsInputInclude.find(
      (e) => e.name === key
    );
    let composite: string;
    if (relations) {
      composite = `${key}RelationsInputInclude`;
    } else {
      continue;
    }

    modelsPerName.set(
      key,
      `${value}\n${convertModelToStandalone({
        name: `${key}InputInclude`,
        stringRepresentation: composite,
      })}`
    );
  }

  for (const [key, value] of modelsPerName) {
    const create = processedRelationsInputCreate.find((e) => e.name === key);

    if (create) {
      const composite = makeComposite([
        `${key}PlainInputCreate`,
        `${key}RelationsInputCreate`,
      ]);
      modelsPerName.set(
        key,
        `${value}\n${convertModelToStandalone({
          name: `${key}InputCreate`,
          stringRepresentation: composite,
        })}`
      );
    }
  }

  for (const [key, value] of modelsPerName) {
    const update = processedRelationsInputUpdate.find((e) => e.name === key);

    if (update) {
      const composite = makeComposite([
        `${key}PlainInputUpdate`,
        `${key}RelationsInputUpdate`,
      ]);
      modelsPerName.set(
        key,
        `${value}\n${convertModelToStandalone({
          name: `${key}InputUpdate`,
          stringRepresentation: composite,
        })}`
      );
    }
  }

  for (const [key, value] of modelsPerName) {
    modelsPerName.set(
      key,
      `${typepoxImportStatement()}\n${nullableImport()}\n${value}`
    );
  }

  modelsPerName.set(getConfig().nullableName, nullableType());

  return modelsPerName;
}
