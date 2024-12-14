const p = require("node:path");
const esbuild = require("esbuild");
const { glob } = require("glob");

async function main() {
  const workers = await glob("src/**/*.worker.ts");
  const define = {};
  for (const worker of workers) {
    const out = await esbuild.build({
      entryPoints: [worker],
      bundle: true,
      minify: true,
      outfile: p.join("dist", p.basename(worker, ".worker.ts") + ".worker.js"),
      platform: "node",
      write: false,
    });
    define[`WORKERS.${p.basename(worker, ".worker.ts").toUpperCase()}`] =
      JSON.stringify(out.outputFiles[0].text);
  }

  await esbuild.build({
    entryPoints: [p.join("src", "index.ts")],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: p.join("dist", "aoc-2024.js"),
    platform: "node",
    define,
  });

  const entries = await glob("src/**/*.entry.ts");
  for (const entry of entries) {
    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      minify: true,
      outfile: p.join("dist", p.basename(entry, ".entry.ts") + ".js"),
      platform: "node",
      define,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
