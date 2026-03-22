import { getConfig } from "../../config";

export function nullableType() {
  const {
    typeboxImportDependencyName,
    typeboxImportVariableName,
    nullableName,
  } = getConfig();

  if (typeboxImportDependencyName === "typebox") {
    return `import ${
      typeboxImportVariableName
    }, { type TSchema } from "${typeboxImportDependencyName}"
export const ${nullableName} = <T extends TSchema>(schema: T) => ${
      typeboxImportVariableName
    }.Union([${typeboxImportVariableName}.Null(), schema])\n`;
  }

  return `import { ${
    typeboxImportVariableName
  }, type TSchema } from "${typeboxImportDependencyName}"
export const ${nullableName} = <T extends TSchema>(schema: T) => ${
    typeboxImportVariableName
  }.Union([${typeboxImportVariableName}.Null(), schema])\n`;
}

export function nullableImport() {
  const { nullableName, importFileExtension } = getConfig();

  return `import { ${nullableName} } from "./${
    nullableName
  }${importFileExtension}"\n`;
}

export function wrapWithNullable(input: string) {
  const { nullableName } = getConfig();

  return `${nullableName}(${input})`;
}
