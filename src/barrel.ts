export function generateBarrelFile(imports: string[]) {
	return imports.map((i) => `export * from "./${i}";`).join("\n");
}
