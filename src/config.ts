import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const configSchema = Type.Object(
  {
    /**
     * Where to output the generated files
     */
    output: Type.String({ default: "./prisma/prismabox" }),
    /**
     * The name of the variable to import the Type from typebox
     */
    typeboxImportVariableName: Type.String({ default: "Type" }),
    /**
     * The name of the dependency to import the Type from typebox
     */
    typeboxImportDependencyName: Type.String({ default: "@sinclair/typebox" }),
    /**
     * Whether to allow additional properties in the generated schemes
     */
    additionalProperties: Type.Boolean({ default: false }),
    /**
     * Should the input schemes be generated
     */
    inputModel: Type.Boolean({ default: false }),
    /**
     * Should the input select be generated
     */
    selectModel: Type.Boolean({ default: false }),
    /**
     * Should the input include be generated
     */
    includeModel: Type.Boolean({ default: false }),
    /**
     * Should the input orderBy be generated
     */
    orderByModel: Type.Boolean({ default: false }),
    /**
     * Prevents the ID field from being generated in the input model
     */
    ignoreIdOnInputModel: Type.Boolean({ default: true }),
    /**
     * Prevents the createdAt field from being generated in the input model
     */
    ignoreCreatedAtOnInputModel: Type.Boolean({ default: true }),
    /**
     * Prevents the updatedAt field from being generated in the input model
     */
    ignoreUpdatedAtOnInputModel: Type.Boolean({ default: true }),
    /**
     * How the nullable union should be named
     */
    nullableName: Type.String({ default: "__nullable__" }),
    /**
     * Whether to allow recursion in the generated schemes (enabling reduces code size)
     */
    allowRecursion: Type.Boolean({ default: true }),
    /**
		 * Additional fields to add to the generated schemes (must be valid strings in the context of usage)
	 * @example 
	 * ```prisma
	 * generator prismabox {
			provider   = "node ./dist/cli.js"
			 inputModel = true
			 output     = "./generated/schema"
			 additionalFieldsPlain = ["additional: Type.Optional(Type.String())"]
		 }
	 ```
		 */
    additionalFieldsPlain: Type.Optional(Type.Array(Type.String())),
    /**
     * When enabled, this option ensures that only primitive types are generated as JSON types.
     * This ensures compatibility with tooling that only supports the serilization to JSON primitive types.
     *
     * E.g. Date will be of Type String when enabled.
     */
    useJsonTypes: Type.Boolean({ default: false }),
    /**
     * What file extension, if any, to add to src file imports. Set to ".js" to support nodenext module resolution
     */
    importFileExtension: Type.String({ default: "" }),
  },
  { additionalProperties: false }
);

// biome-ignore lint/suspicious/noExplicitAny: we want to set the default value
let config: Static<typeof configSchema> = {} as unknown as any;

export function setConfig(input: unknown) {
  try {
    Value.Clean(configSchema, input);
    Value.Default(configSchema, input);
    config = Value.Decode(configSchema, Value.Convert(configSchema, input));
    Object.freeze(config);
  } catch (error) {
    console.error(Value.Errors(configSchema, input).First);
    throw error;
  }
}
export function getConfig() {
  return config;
}
