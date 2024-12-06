import fs from "node:fs";
import arg from "arg";
import { days } from "./days";

const fsp = fs.promises;

async function main() {
  const args = arg({
    "--day": Number,
    "--input": String,
    "-d": "--day",
    "-i": "--input",
  });

  const day = args["--day"] ?? null;
  const inputFile = args["--input"] ?? null;

  const solver = day !== null ? (days.get(day) ?? null) : null;

  if (!solver) {
    throw new Error(`Unknown day (--day, -d) (${args["--day"]})`);
  }

  if (!inputFile) {
    throw new Error("Input file (--input, -i) is mandatory");
  }

  const input = await fsp.readFile(inputFile, "utf-8");
  console.log(`Part 1: ${await solver.partOne(input)}`);
  console.log(`Part 2: ${await solver.partTwo(input)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
