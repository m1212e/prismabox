import { describe, expect, it } from "bun:test";
import { setConfig } from "../src/config";
import { stringifyEnum } from "../src/generators/enum";
import { wrapWithArray } from "../src/generators/wrappers/array";
import { makeUnion } from "../src/generators/wrappers/union";

/**
 * `additionalProperties` is defined for objects. Ajv in strict mode refuses to compile a
 * schema that carries it without `type: "object"` (#51), and it is meaningless on an
 * array (#36). Only object schemas should ever receive it.
 */
setConfig({ typeboxImportVariableName: "Type", additionalProperties: false });

describe("additionalProperties is confined to object schemas", () => {
  it("is absent from an enum", () => {
    const generated = stringifyEnum({
      name: "Status",
      values: [{ name: "active", dbName: null }],
      dbName: null,
      documentation: undefined,
    });

    expect(generated).toContain("Type.Literal('active')");
    expect(generated).not.toContain("additionalProperties");
  });

  it("is absent from an array", () => {
    expect(wrapWithArray("Type.String()")).not.toContain(
      "additionalProperties",
    );
  });

  it("is absent from a union", () => {
    expect(makeUnion(["Type.Literal('a')", "Type.Literal('b')"])).not.toContain(
      "additionalProperties",
    );
  });

  it("survives on an enum's own annotations", () => {
    const generated = stringifyEnum({
      name: "Status",
      values: [{ name: "active", dbName: null }],
      dbName: null,
      documentation: "The state of the thing",
    });

    expect(generated).toContain("description");
  });
});
