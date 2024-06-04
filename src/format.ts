import { format as prettierFormat } from "prettier";

export async function format(input: string) {
	try {
		return await prettierFormat(input, { parser: "typescript" });
	} catch (error) {
		console.error("Error formatting file", error);
		return input;
	}
}
