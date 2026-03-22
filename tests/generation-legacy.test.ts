import { describe, expect, test } from "bun:test";
import { setConfig } from "../src/config";
import { stringifyPrimitiveType } from "../src/generators/primitiveField";
import { transformDateType } from "../src/generators/transformDate";
import { makeComposite } from "../src/generators/wrappers/composite";
import { nullableType } from "../src/generators/wrappers/nullable";
import {
  TYPEBOX_DATE_NAME,
  TYPEBOX_UINT8_ARRAY_NAME,
} from "../src/generators/wrappers/typeboxCompat";
import { mapAllModelsForWrite } from "../src/model";

describe("legacy generation mode", () => {
  test("keeps composite for legacy typebox dependency", () => {
    setConfig({
      typeboxImportDependencyName: "@sinclair/typebox",
      typeboxImportVariableName: "Type",
      additionalProperties: false,
    });

    const output = makeComposite(["PostPlain", "PostRelations"]);
    expect(output).toContain(".Composite([PostPlain,PostRelations]");
    expect(output).not.toContain(".Evaluate(");
  });

  test("keeps transform helper for legacy dependency", () => {
    setConfig({
      typeboxImportDependencyName: "@sinclair/typebox",
      typeboxImportVariableName: "Type",
    });

    const output = transformDateType();
    expect(output).toContain('import { Type } from "@sinclair/typebox"');
    expect(output).toContain(".Transform(");
  });

  test("keeps nullable helper import format for legacy dependency", () => {
    setConfig({
      typeboxImportDependencyName: "@sinclair/typebox",
      typeboxImportVariableName: "Type",
    });

    const output = nullableType();
    expect(output).toContain(
      'import { Type, type TSchema } from "@sinclair/typebox"',
    );
  });

  test("keeps Date and Uint8Array primitive outputs for legacy dependency", () => {
    setConfig({
      typeboxImportDependencyName: "@sinclair/typebox",
      typeboxImportVariableName: "Type",
      useJsonTypes: false,
    });

    expect(
      stringifyPrimitiveType({ fieldType: "DateTime", options: "{}" }),
    ).toContain("Type.Date({})");
    expect(
      stringifyPrimitiveType({ fieldType: "Bytes", options: "{}" }),
    ).toContain("Type.Uint8Array({})");
  });

  test("does not write compat helper files for legacy dependency", () => {
    setConfig({
      typeboxImportDependencyName: "@sinclair/typebox",
      typeboxImportVariableName: "Type",
    });

    const mappings = mapAllModelsForWrite();
    expect(mappings.has(TYPEBOX_DATE_NAME)).toBe(false);
    expect(mappings.has(TYPEBOX_UINT8_ARRAY_NAME)).toBe(false);
  });
});
