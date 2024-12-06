const p = require("node:path");
const fs = require("node:fs");
const esbuild = require("esbuild");
const { glob } = require("glob");

const fsp = fs.promises;

async function main() {
  const tests = await glob("src/**/*.test.ts");
  const master = tests
    .map((name) => p.relative("src", name))
    .map((name) => name.replaceAll(p.sep, p.posix.sep))
    .sort()
    .map((name) => `import "./${name}";`);

  master.unshift(
    "// This file was autogenerated while building tests. Do not edit manually",
  );
  master.push("");

  const masterName = p.join("src", "tests.ts");
  await fsp.writeFile(masterName, master.join("\n"));

  await esbuild.build({
    entryPoints: [masterName],
    outfile: p.join("dist", "tests.js"),
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: "node",
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
