import { getConfig } from "../config";
import { type extractAnnotations, isOptionsVariant } from "./annotations";

export function generateTypeboxOptions({
  input,
  exludeAdditionalProperties,
}: {
  input?: ReturnType<typeof extractAnnotations>;
  exludeAdditionalProperties?: boolean;
} = {}): string {
  if (exludeAdditionalProperties === undefined) {
    exludeAdditionalProperties = !getConfig().additionalProperties;
  }

  const stringifiedOptions: string[] = [];
  for (const annotation of input?.annotations ?? []) {
    if (isOptionsVariant(annotation)) {
      stringifiedOptions.push(annotation.value);
    }
  }

  if (exludeAdditionalProperties) {
    stringifiedOptions.push(
      `additionalProperties: ${getConfig().additionalProperties}`,
    );
  }

  if (input?.description) {
    stringifiedOptions.push(`description: \`${input.description}\``);
  }

  return stringifiedOptions.length > 0
    ? `{${stringifiedOptions.join(",")}}`
    : "";
}
