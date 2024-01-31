import { build } from "esbuild";
import { exists, rm } from "fs/promises";
import packagejson from "./package.json";

if (await exists("./dist")) {
	await rm("./dist", { force: true, recursive: true });
}

const output = await build({
	entryPoints: ["./src/index.ts"],
	outdir: "./dist",
	platform: "node",
	format: "cjs",
	sourcemap: "external",
	minify: true,
	bundle: true,
	external: [
		...Object.keys(packagejson.dependencies),
		...Object.keys(packagejson.devDependencies),
	],
});

if (output.errors) {
	console.error(output.errors);
} else {
	console.info("Built successfully!");
}
