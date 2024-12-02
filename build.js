const p = require("node:path");
const esbuild = require("esbuild");

async function main() {
  await esbuild.build({
    entryPoints: [p.join("src", "index.ts")],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: p.join("dist", "aoc-2024.js"),
    platform: "node",
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
