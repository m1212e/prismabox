export const typeboxImportVariableName: string = "Type";

export function TypeboxImport() {
	return `import { ${typeboxImportVariableName} } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";`;
}
