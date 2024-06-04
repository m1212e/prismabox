import { getConfig } from "../config";

export enum NullableVariant {
	NULLABLE = 0, // null or the value
	OPTIONAL = 1, // undefined or the value
	OPTIONAL_NULLABLE = 3, // null, undefined or the value
}

export function nullableType() {
	return `import { ${
		getConfig().typeboxImportVariableName
	}, type TSchema } from "${getConfig().typeboxImportDependencyName}"
export const ${getConfig().nullableName} = <T extends TSchema>(schema: T) => ${
		getConfig().typeboxImportVariableName
	}.Union([${getConfig().typeboxImportVariableName}.Null(), schema])\n`;
}

export function nullableImport() {
	return `import { ${getConfig().nullableName} } from "./${
		getConfig().nullableName
	}"\n`;
}

export function wrapWithNullable({
	input,
	variant,
}: { input: string; variant: NullableVariant }) {
	let ret = "";

	if (variant === NullableVariant.NULLABLE) {
		ret += `${getConfig().nullableName}(`;
	} else if (variant === NullableVariant.OPTIONAL) {
		ret += `${getConfig().nullableName}.Optional(`;
	} else if (variant === NullableVariant.OPTIONAL_NULLABLE) {
		ret += `${getConfig().nullableName}.Optional(${getConfig().nullableName}(`;
	} else {
		throw new Error("Invalid NullableVariant");
	}

	ret += input;

	if (
		variant === NullableVariant.NULLABLE ||
		variant === NullableVariant.OPTIONAL
	) {
		ret += ")";
	} else if (variant === NullableVariant.OPTIONAL_NULLABLE) {
		ret += "))";
	}

	return ret;
}
