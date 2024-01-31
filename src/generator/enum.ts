import type { DMMF } from "@prisma/generator-helper";
import { TypeboxImport } from "./typeboxImport";

export class Enum extends Part {
	readonly name: string;
	private variants: EnumVariant[];
	private documentation: string | undefined;
	constructor(
		data: Pick<DMMF.DatamodelEnum, "name" | "values" | "documentation">,
	) {
		super();
		this.name = data.name;
		this.variants = data.values.map((v) => new EnumVariant(v));
		this.documentation = data.documentation;
	}

	private optionsString() {
		if (!this.documentation) {
			return "";
		}

		return `, {description: "${this.documentation}"}`;
	}

	stringify(): string {
		return `
export const ${this.name} = ${TypeboxImport.variableName}.Union([
    ${this.variants
			.map((v) => v.stringify())
			.reduce((prev, curr) => `${prev + curr},`, "")}
]${this.optionsString()});`;
	}
}

class EnumVariant extends Part {
	private variantName: string;
	constructor(data: Pick<DMMF.DatamodelEnum["values"][number], "name">) {
		super();
		this.variantName = data.name;
	}

	stringify(): string {
		return `${TypeboxImport.variableName}.Literal('${this.variantName}')`;
	}
}
