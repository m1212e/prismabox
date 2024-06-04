import { build } from "esbuild";
import { exists, rm, copyFile, writeFile } from "node:fs/promises";
import packagejson from "./package.json";

if (await exists("./dist")) {
	await rm("./dist", { force: true, recursive: true });
}

const output = await build({
	entryPoints: ["./src/cli.ts"],
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

let version = process.env.REF_NAME ?? packagejson.version;
if (!version) {
	version = "0.0.1";
}

await copyFile("./README.md", "./dist/README.md");
await copyFile("./LICENSE", "./dist/LICENSE");
await writeFile(
	"./dist/package.json",
	JSON.stringify({
		...packagejson,
		version,
		bin: { prismabox: "cli.js" },
	}),
);
