const p = require("node:path");
const esbuild = require("esbuild");
const { glob } = require("glob");

async function main() {
  const common = {
    bundle: true,
    minify: true,
    logOverride: {
      "direct-eval": "debug",
    },
    format: "iife",
  };

  const define = {};
  const workers = await glob("src/**/*.worker.ts");
  for (const worker of workers) {
    const out = await esbuild.build({
      entryPoints: [worker],
      outfile: p.join(
        "browser",
        p.basename(worker, ".worker.ts") + ".worker.js",
      ),
      write: false,
      ...common,
    });
    define[`WORKERS.${p.basename(worker, ".worker.ts").toUpperCase()}`] =
      JSON.stringify(out.outputFiles[0].text);
  }

  const browserSpecificWorkers = await glob("src/**/*.browser.worker.ts");
  for (const worker of browserSpecificWorkers) {
    const out = await esbuild.build({
      entryPoints: [worker],
      outfile: p.join(
        "browser",
        p.basename(worker, ".browser.worker.ts") + ".worker.js",
      ),
      write: false,
      ...common,
      define,
    });
    define[
      `WORKERS.${p.basename(worker, ".browser.worker.ts").toUpperCase()}`
    ] = JSON.stringify(out.outputFiles[0].text);
  }

  const entries = await glob("src/**/*.browser.ts");
  for (const entry of entries) {
    await esbuild.build({
      entryPoints: [entry],
      sourcemap: true,
      outfile: p.join("browser", p.basename(entry, ".browser.ts") + ".js"),
      define,
      ...common,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
