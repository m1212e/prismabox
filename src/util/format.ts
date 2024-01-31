import { format as prettierFormat } from "prettier";

export function format(input: string) {
	return prettierFormat(input, { parser: "typescript" });
}
