const p = require("node:path");
const esbuild = require("esbuild");
const { glob } = require("glob");

async function main() {
  const tests = await glob("src/**/*.test.ts");
  for (let test of tests) {
    const outfile = p.join(
      "tests",
      p.relative("src", p.dirname(test)),
      p.basename(test, ".test.ts") + ".test.js",
    );

    await esbuild.build({
      entryPoints: [test],
      outfile,
      bundle: true,
      minify: true,
      sourcemap: true,
      platform: "node",
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
