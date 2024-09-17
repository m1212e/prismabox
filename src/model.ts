import { getConfig } from "./config";
import { processedEnums } from "./generators/enum";
import { processedPlain } from "./generators/plain";
import { processedPlainInputCreate } from "./generators/plainInputCreate";
import { processedPlainOrderBy } from "./generators/plainInputOrderBy";
import { processedPlainSelect } from "./generators/plainInputSelect";
import { processedPlainInputUpdate } from "./generators/plainInputUpdate";
import { processedRelations } from "./generators/relations";
import { processedRelationsInputCreate } from "./generators/relationsInputCreate";
import { processedRelationsInclude } from "./generators/relationsInputInclude";
import { processedRelationsOrderBy } from "./generators/relationsInputOrderBy";
import { processedRelationsSelect } from "./generators/relationsInputSelect";
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
  process(processedPlainSelect, "PlainSelect");
  process(processedPlainOrderBy, "PlainOrderBy");
  process(processedRelationsInputCreate, "RelationsInputCreate");
  process(processedRelationsInputUpdate, "RelationsInputUpdate");
  process(processedRelationsSelect, "RelationsSelect");
  process(processedRelationsInclude, "RelationsInclude");
  process(processedRelationsOrderBy, "RelationsOrderBy");
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
    const plain = processedPlainSelect.find((e) => e.name === key);
    const relations = processedRelationsSelect.find((e) => e.name === key);
    let composite: string;
    if (plain && relations) {
      composite = makeComposite([
        `${key}PlainSelect`,
        `${key}RelationsSelect`,
      ]);
    } else if (plain) {
      composite = `${key}PlainSelect`;
    } else if (relations) {
      composite = `${key}RelationsSelect`;
    } else {
      continue;
    }

    modelsPerName.set(
      key,
      `${value}\n${convertModelToStandalone({
        name: `${key}Select`,
        stringRepresentation: composite,
      })}`
    );
  }

  for (const [key, value] of modelsPerName) {
    const plain = processedPlainOrderBy.find((e) => e.name === key);
    const relations = processedRelationsOrderBy.find((e) => e.name === key);
    let composite: string;
    if (plain && relations) {
      composite = makeComposite([
        `${key}PlainOrderBy`,
        `${key}RelationsOrderBy`,
      ]);
    } else if (plain) {
      composite = `${key}PlainOrderBy`;
    } else if (relations) {
      composite = `${key}RelationsOrderBy`;
    } else {
      continue;
    }

    modelsPerName.set(
      key,
      `${value}\n${convertModelToStandalone({
        name: `${key}OrderBy`,
        stringRepresentation: composite,
      })}`
    );
  }

  for (const [key, value] of modelsPerName) {
    const relations = processedRelationsInclude.find((e) => e.name === key);
    let composite: string;
    if (relations) {
      composite = `${key}RelationsInclude`;
    } else {
      continue;
    }

    modelsPerName.set(
      key,
      `${value}\n${convertModelToStandalone({
        name: `${key}Include`,
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
