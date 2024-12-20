import assert from "node:assert";
import fs from "node:fs";
import arg from "arg";
import RE2 from "re2";
import { parse } from ".";

const fsp = fs.promises;

async function main() {
  const args = arg({
    "--input": String,
    "-i": "--input",
  });

  const input = args["--input"];
  assert(input, "input is given");

  const inputContents = await fsp.readFile(input, "utf-8");
  const { patterns, designs } = parse(inputContents);
  const rexp = new RE2(`^(?:${patterns.join("|")})*$`, "u");
  const result = designs.filter((design) => rexp.test(design)).length;
  console.log(`Part 1: ${result}`);
}

main().catch((error) => {
  console.error(error);
});
