import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getConfig } from "./config";
import { format } from "./format";
import { mapAllModelsForWrite } from "./model";

export async function write() {
	return Promise.all(
		Array.from(mapAllModelsForWrite().entries()).map(
			async ([name, content]) => {
				return writeFile(
					join(getConfig().output, `${name}.ts`),
					await format(content.stringRepresentation),
				);
			},
		),
	);
}
