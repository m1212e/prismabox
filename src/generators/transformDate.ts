import { getConfig } from "../config";

export function transformDateType() {
  return `import { type StringOptions, ${getConfig().typeboxImportVariableName} } from "${getConfig().typeboxImportDependencyName}";
  export const ${getConfig().transformDateName} = (options?: StringOptions) => ${
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
