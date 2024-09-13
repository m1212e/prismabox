import { Type } from "@sinclair/typebox";
import { generateTypeboxOptions } from "../../annotations/options";
import { getConfig } from "../../config";

export function wrapWithSelect(input: string) {
  return `${getConfig().typeboxImportVariableName}.Object({
    select: ${input}
})`;
}
