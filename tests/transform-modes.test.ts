import { describe, expect, test } from "bun:test";
import { setConfig } from "../src/config";
import { stringifyPrimitiveType } from "../src/generators/primitiveField";

describe("datetime generation modes", () => {
  test("useJsonTypes = true emits string with date-time format", () => {
    setConfig({
      typeboxImportDependencyName: "typebox",
      typeboxImportVariableName: "Type",
      useJsonTypes: true,
    });

    const output = stringifyPrimitiveType({
      fieldType: "DateTime",
      options: "{description: 'a date'}",
    });
    expect(output).toContain("Type.String(");
    expect(output).toContain("format: 'date-time'");
  });

  test("useJsonTypes = transformer emits transform helper call", () => {
    setConfig({
      typeboxImportDependencyName: "typebox",
      typeboxImportVariableName: "Type",
      useJsonTypes: "transformer",
    });

    const output = stringifyPrimitiveType({
      fieldType: "DateTime",
      options: "{}",
    });
    expect(output).toContain("__transformDate__({})");
  });

  test("useJsonTypes = false emits date compat helper in typebox mode", () => {
    setConfig({
      typeboxImportDependencyName: "typebox",
      typeboxImportVariableName: "Type",
      useJsonTypes: false,
    });

    const output = stringifyPrimitiveType({
      fieldType: "DateTime",
      options: "{}",
    });
    expect(output).toContain("__typeboxDate__({})");
  });
});
