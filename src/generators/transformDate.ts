import { getConfig } from "../config";

export function transformDateType() {
  const {
    typeboxImportDependencyName,
    typeboxImportVariableName,
    transformDateName,
  } = getConfig();

  if (typeboxImportDependencyName === "typebox") {
    return `import ${
      typeboxImportVariableName
    } from "${typeboxImportDependencyName}";
  export const ${transformDateName} = (options?: Parameters<typeof ${typeboxImportVariableName}.String>[0]) => ${
    typeboxImportVariableName
  }.Codec(${typeboxImportVariableName}.String({ format: 'date-time', ...options }))
   .Decode((value) => new Date(value))
   .Encode((value) => value.toISOString())\n`;
  }

  return `import { ${typeboxImportVariableName} } from "${typeboxImportDependencyName}";
  export const ${transformDateName} = (options?: Parameters<typeof ${typeboxImportVariableName}.String>[0]) => ${
    typeboxImportVariableName
  }.Transform(${typeboxImportVariableName}.String({ format: 'date-time', ...options }))
   .Decode((value) => new Date(value))
   .Encode((value) => value.toISOString())\n`;
}

export function transformDateImportStatement() {
  const { importFileExtension, transformDateName } = getConfig();

  return `import { ${transformDateName} } from "./${
    transformDateName
  }${importFileExtension}"\n`;
}
