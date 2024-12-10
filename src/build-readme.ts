import fs from "node:fs";
import assert from "node:assert";
import arg from "arg";
import { generateReport } from "./self-test";
import { AssertionError } from "node:assert";

const fsp = fs.promises;

async function asyncCollect<T>(generator: AsyncGenerator<T, any, any>) {
  let result: T[] = [];
  for await (const entry of generator) {
    result.push(entry);
  }
  return result;
}

const TITLES = [
  "Day 1: Historian Hysteria",
  "Day 2: Red-Nosed Reports",
  "Day 3: Mull It Over",
  "Day 4: Ceres Search",
  "Day 5: Print Queue",
  "Day 6: Guard Gallivant",
  "Day 7: Bridge Repair",
  "Day 8: Resonant Collinearity",
  "Day 9: Disk Fragmenter",
  "Day 10: Hoof It",
];

async function main() {
  const args = arg({
    "--input": String,
    "-i": "--input",
  });

  assert(args["--input"], "--input/-i was provided");

  let report = await asyncCollect(generateReport(args["--input"]));
  const reportMap = report.reduce(
    (acc, entry) => acc.set(entry.day, entry),
    new Map<number, (typeof report)[0]>(),
  );
  let csv: string[] = [];
  for (let i = 1; i <= 25; ++i) {
    const entry = reportMap.get(i);
    if (!entry) {
      csv.push(`${i},,,`);
      continue;
    }
    const p1 = entry.partOne ? "\u2705" : "\u274C";
    const p2 = entry.partTwo ? "\u2705" : "\u274C";
    csv.push(`${TITLES[i - 1]},${p1},${p2},${entry.time.toFixed(0)}ms`);
  }

  const fullCsv = csv.join("\n");
  const template = await fsp.readFile("README.template.adoc", "utf-8");
  const readme = template.replace("--SELFTEST-DATA--", fullCsv);
  await fsp.copyFile("README.adoc", "README.adoc.bak");
  await fsp.writeFile("README.adoc", readme);
}

main().catch((error) => {
  console.error(
    error instanceof AssertionError
      ? `AssertionError: ${error.message}`
      : error,
  );
  process.exit(1);
});
