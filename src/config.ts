import { Type, type Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const configSchema = Type.Object(
	{
		output: Type.String({ default: "./prisma/prismabox" }),
		typeboxImportVariableName: Type.String({ default: "Type" }),
		typeboxImportDependencyName: Type.String({ default: "@sinclair/typebox" }),
		additionalProperties: Type.Boolean({ default: false }),
		inputModel: Type.Boolean({ default: false }),
		ignoreIdOnInputModel: Type.Boolean({ default: true }),
		ignoreCreatedAtOnInputModel: Type.Boolean({ default: true }),
		ignoreUpdatedAtOnInputModel: Type.Boolean({ default: true }),
		nullableName: Type.String({ default: "__nullable__" }),
		allowRecursion: Type.Boolean({ default: true }),
    	useJsonTypes: Type.Boolean({ default: false })
	},
	{ additionalProperties: false },
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
