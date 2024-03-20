import type { DMMF } from "@prisma/generator-helper";

export enum Annotation {
  HIDDEN = 0,
}

/**
 * If the models should allow additional properties
 */
export let additionalProperties = false;

export function setAdditionalProperties(value: boolean) {
  additionalProperties = value;
}

export function parseDocumentation(
  raw: DMMF.Model["fields"][number]["documentation"]
) {
  if (!raw) {
    return { options: "", annotations: [] };
  }

  const annotations: Annotation[] = [];

  let options = "{";
  let description = "";

  for (const line of raw.split("\n")) {
    if (
      line.startsWith("@prismabox.hide") ||
      line.startsWith("@prismabox.hidden")
    ) {
      annotations.push(Annotation.HIDDEN);
    } else if (line.startsWith("@prismabox.options")) {
      if (!line.startsWith("@prismabox.options{")) {
        throw new Error(
          "Invalid syntax, expected opening { after prismabox.options"
        );
      }
      if (!line.endsWith("}")) {
        throw new Error(
          "Invalid syntax, expected closing } for prismabox.options"
        );
      }

      options += `${line.substring(19, line.length - 1)},`;
    } else {
      description += `${line}\n`;
    }
  }

  if (description.length > 0) {
    options += `description: \`${description.trim()}\`,`;
  }

  options += `additionalProperties: ${additionalProperties},`;

  options += "}";

  return { options, annotations: annotations };
}
