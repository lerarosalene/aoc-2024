const p = require("node:path");
const esbuild = require("esbuild");
const { glob } = require("glob");

async function main() {
  await esbuild.build({
    entryPoints: [p.join("src", "index.ts")],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: p.join("dist", "aoc-2024.js"),
    platform: "node",
  });

  await esbuild.build({
    entryPoints: [p.join("src", "build-readme.ts")],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: p.join("dist", "build-readme.js"),
    platform: "node",
  });

  const workers = await glob("src/**/*.worker.ts");
  for (const worker of workers) {
    await esbuild.build({
      entryPoints: [worker],
      bundle: true,
      minify: true,
      sourcemap: true,
      outfile: p.join("dist", p.basename(worker, ".worker.ts") + ".worker.js"),
      platform: "node",
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
