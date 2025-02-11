import { getConfig } from "../config";

export function transformDateType() {
  return `import { ${getConfig().typeboxImportVariableName} } from "${getConfig().typeboxImportDependencyName}";
  export const ${getConfig().transformDateName} = (options?: Parameters<typeof ${getConfig().typeboxImportVariableName}.String>[0]) => ${
    getConfig().typeboxImportVariableName
  }.Transform(${getConfig().typeboxImportVariableName}.String({ format: 'date-time', ...options }))
   .Decode((value) => new Date(value))
   .Encode((value) => value.toISOString())\n`;
}

export function transformDateImportStatement() {
  return `import { ${getConfig().transformDateName} } from "./${
    getConfig().transformDateName
  }${getConfig().importFileExtension}"\n`;
}
