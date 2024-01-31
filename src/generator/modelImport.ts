export function ModelImports(imports: string[]) {
	return imports
		.map((i) => `import { ${i}, ${i}Plain } from "./${i}";`)
		.reduce((prev, curr) => `${prev}\n${curr}`, "");
}
