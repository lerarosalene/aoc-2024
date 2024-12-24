const p = require("node:path");
const esbuild = require("esbuild");
const { glob } = require("glob");
const NativePlugin = require("./native-plugin");

async function main() {
  const common = {
    bundle: true,
    minify: true,
    platform: "node",
    plugins: [new NativePlugin()],
    logOverride: {
      "direct-eval": "debug",
    },
  };

  const workers = await glob("src/**/*.worker.ts");
  const define = {};
  for (const worker of workers) {
    const out = await esbuild.build({
      entryPoints: [worker],
      outfile: p.join("dist", p.basename(worker, ".worker.ts") + ".worker.js"),
      write: false,
      ...common,
    });
    define[`WORKERS.${p.basename(worker, ".worker.ts").toUpperCase()}`] =
      JSON.stringify(out.outputFiles[0].text);
  }

  await esbuild.build({
    entryPoints: [p.join("src", "index.ts")],
    sourcemap: true,
    outfile: p.join("dist", "aoc-2024.js"),
    define,
    ...common,
  });

  const entries = await glob("src/**/*.entry.ts");
  for (const entry of entries) {
    await esbuild.build({
      entryPoints: [entry],
      sourcemap: true,
      outfile: p.join("dist", p.basename(entry, ".entry.ts") + ".js"),
      define,
      ...common,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
