import { Type, type Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { TypeCompiler } from "@sinclair/typebox/compiler";

const configSchema = Type.Object(
	{
		output: Type.String({ default: "./prisma/prismabox" }),
		typeboxImportVariableName: Type.String({ default: "Type" }),
		typeboxImportDependencyName: Type.String({ default: "@sinclair/typebox" }),
		additionalProperties: Type.Boolean({ default: false }),
		dataModel: Type.Boolean({ default: false }),
		plainAdditionalFields: Type.Array(Type.String(), { default: [] }),
		nullableName: Type.String({ default: "__nullable__" }),
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
		return config;
	} catch (error) {
		console.error(Value.Errors(configSchema, input).First);
		throw error;
	}
}
export function getConfig() {
	return config;
}
