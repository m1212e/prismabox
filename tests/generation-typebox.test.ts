import { describe, expect, test } from "bun:test";
import { setConfig } from "../src/config";
import { stringifyPrimitiveType } from "../src/generators/primitiveField";
import { transformDateType } from "../src/generators/transformDate";
import { stringifyWhere } from "../src/generators/where";
import { makeComposite } from "../src/generators/wrappers/composite";
import { nullableType } from "../src/generators/wrappers/nullable";
import {
  TYPEBOX_DATE_NAME,
  TYPEBOX_UINT8_ARRAY_NAME,
} from "../src/generators/wrappers/typeboxCompat";
import { mapAllModelsForWrite } from "../src/model";

describe("typebox generation mode", () => {
  test("uses evaluate + intersect instead of composite", () => {
    setConfig({
      typeboxImportDependencyName: "typebox",
      typeboxImportVariableName: "Type",
      additionalProperties: false,
    });

    const output = makeComposite(["PostPlain", "PostRelations"]);
    expect(output).toContain(
      "Type.Evaluate(Type.Intersect([PostPlain,PostRelations], {additionalProperties: false}))",
    );
    expect(output).not.toContain(".Composite(");
  });

  test("uses codec and default import in transform date helper", () => {
    setConfig({
      typeboxImportDependencyName: "typebox",
      typeboxImportVariableName: "Type",
    });

    const output = transformDateType();
    expect(output).toContain('import Type from "typebox"');
    expect(output).toContain(".Codec(");
    expect(output).not.toContain(".Transform(");
  });

  test("uses nullable helper import format for typebox", () => {
    setConfig({
      typeboxImportDependencyName: "typebox",
      typeboxImportVariableName: "Type",
    });

    const output = nullableType();
    expect(output).toContain('import Type, { type TSchema } from "typebox"');
  });

  test("uses typebox date and uint8array compat helper in primitive field output", () => {
    setConfig({
      typeboxImportDependencyName: "typebox",
      typeboxImportVariableName: "Type",
      useJsonTypes: false,
    });

    expect(
      stringifyPrimitiveType({ fieldType: "DateTime", options: "{}" }),
    ).toContain(`${TYPEBOX_DATE_NAME}({})`);
    expect(
      stringifyPrimitiveType({ fieldType: "Bytes", options: "{}" }),
    ).toContain(`${TYPEBOX_UINT8_ARRAY_NAME}({})`);
  });

  test("writes compat helper files into output mapping", () => {
    setConfig({
      typeboxImportDependencyName: "typebox",
      typeboxImportVariableName: "Type",
    });

    const mappings = mapAllModelsForWrite();
    const dateCompat = mappings.get(TYPEBOX_DATE_NAME) ?? "";
    const uint8Compat = mappings.get(TYPEBOX_UINT8_ARRAY_NAME) ?? "";
    expect(dateCompat).toContain("Type.Refine(");
    expect(dateCompat).toContain("Type.Unsafe<globalThis.Date>");
    expect(uint8Compat).toContain("Type.Refine(");
    expect(uint8Compat).toContain("Type.Unsafe<globalThis.Uint8Array>");
  });

  test("uses cyclic in where generation when recursion is enabled", () => {
    setConfig({
      typeboxImportDependencyName: "typebox",
      typeboxImportVariableName: "Type",
      allowRecursion: true,
    });

    const output =
      stringifyWhere({
        name: "User",
        documentation: null,
        fields: [
          {
            name: "id",
            type: "String",
            documentation: null,
            isList: false,
            isRequired: true,
          },
        ],
      } as never) ?? "";

    expect(output).toContain("Type.Cyclic(");
    expect(output).toContain('Type.Ref("Self")');
    expect(output).toContain('{ $id: "User" }');
    expect(output).not.toContain("Type.Recursive(");
  });
});
