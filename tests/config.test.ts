import { describe, expect, test } from "bun:test";
import { getConfig, setConfig } from "../src/config";

describe("config defaults", () => {
  test("uses typebox as default import dependency", () => {
    setConfig({});
    expect(getConfig().typeboxImportDependencyName).toBe("typebox");
    expect(getConfig().typeboxImportDependencyName === "typebox").toBe(true);
  });

  test("detects legacy mode when dependency is overridden", () => {
    setConfig({
      typeboxImportDependencyName: "@sinclair/typebox",
    });
    expect(getConfig().typeboxImportDependencyName === "typebox").toBe(false);
  });
});
