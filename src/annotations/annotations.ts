import type { DMMF } from "@prisma/generator-helper";

export type Annotation =
  | { type: "HIDDEN" }
  | { type: "HIDDEN_INPUT" }
  | { type: "HIDDEN_INPUT_CREATE" }
  | { type: "HIDDEN_INPUT_UPDATE" }
  | { type: "OPTIONS"; value: string };

export function isHiddenVariant(
  annotation: Annotation,
): annotation is { type: "HIDDEN"; value: number } {
  return annotation.type === "HIDDEN";
}

export function isHiddenInputVariant(
  annotation: Annotation,
): annotation is { type: "HIDDEN_INPUT"; value: number } {
  return annotation.type === "HIDDEN_INPUT";
}

export function isHiddenInputCreateVariant(
  annotation: Annotation,
): annotation is { type: "HIDDEN_INPUT_CREATE"; value: number } {
  return annotation.type === "HIDDEN_INPUT_CREATE";
}

export function isHiddenInputUpdateVariant(
  annotation: Annotation,
): annotation is { type: "HIDDEN_INPUT_UPDATE"; value: number } {
  return annotation.type === "HIDDEN_INPUT_UPDATE";
}

export function isOptionsVariant(
  annotation: Annotation,
): annotation is { type: "OPTIONS"; value: string } {
  return annotation.type === "OPTIONS";
}

const annotationKeys: { type: Annotation["type"]; keys: string[] }[] = [
  {
    type: "HIDDEN_INPUT_CREATE",
    keys: ["@prismabox.create.input.hide", "@prismabox.create.input.hidden"],
  },
  {
    type: "HIDDEN_INPUT_UPDATE",
    keys: ["@prismabox.update.input.hide", "@prismabox.update.input.hidden"],
  },
  {
    type: "HIDDEN_INPUT",
    keys: [
      // we need to use input.hide instead of hide.input because the latter is a substring of input.hidden
      // and will falsely match
      "@prismabox.input.hide",
      "@prismabox.input.hidden",
    ],
  },
  {
    type: "HIDDEN",
    keys: ["@prismabox.hide", "@prismabox.hidden"],
  },
  {
    type: "OPTIONS",
    keys: ["@prismabox.options"],
  },
];

export function extractAnnotations(
  input: DMMF.Model["fields"][number]["documentation"],
): {
  annotations: Annotation[];
  description: string | undefined;
  isHidden: boolean;
  isHiddenInput: boolean;
  isHiddenInputCreate: boolean;
  isHiddenInputUpdate: boolean;
} {
  const annotations: Annotation[] = [];
  let description = "";

  const raw = input ?? "";

  for (const line of raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)) {
    const annotationKey = annotationKeys.find((key) =>
      key.keys.some((k) => line.startsWith(k)),
    );

    if (annotationKey) {
      if (annotationKey.type === "OPTIONS") {
        if (!line.startsWith(`${annotationKey.keys[0]}{`)) {
          throw new Error(
            "Invalid syntax, expected opening { after prismabox.options",
          );
        }
        if (!line.endsWith("}")) {
          throw new Error(
            "Invalid syntax, expected closing } for prismabox.options",
          );
        }

        annotations.push({
          type: "OPTIONS",
          value: line.substring(
            annotationKey.keys[0].length + 1,
            line.length - 1,
          ),
        });
      } else {
        annotations.push({ type: annotationKey.type });
      }
    } else {
      description += `${line}\n`;
    }
  }

  description = description.trim();
  return {
    annotations,
    description: description.length > 0 ? description : undefined,
    isHidden: isHidden(annotations),
    isHiddenInput: isHiddenInput(annotations),
    isHiddenInputCreate: isHiddenInputCreate(annotations),
    isHiddenInputUpdate: isHiddenInputUpdate(annotations),
  };
}

export function isHidden(annotations: Annotation[]): boolean {
  return annotations.some((a) => a.type === "HIDDEN");
}

export function isHiddenInput(annotations: Annotation[]): boolean {
  return annotations.some((a) => a.type === "HIDDEN_INPUT");
}

export function isHiddenInputCreate(annotations: Annotation[]): boolean {
  return annotations.some((a) => a.type === "HIDDEN_INPUT_CREATE");
}

export function isHiddenInputUpdate(annotations: Annotation[]): boolean {
  return annotations.some((a) => a.type === "HIDDEN_INPUT_UPDATE");
}
