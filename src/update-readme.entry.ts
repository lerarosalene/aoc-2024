import fs from "node:fs";
import assert from "node:assert";
import p from "node:path";
import arg from "arg";
import * as csv from "csv-parse/sync";
import zod from "zod";
import { days as solvers } from "./days";

const fsp = fs.promises;

const Record = zod.object({
  day: zod.string(),
  title: zod.string(),
  result1: zod.string(),
  result2: zod.string(),
  time: zod.string(),
});

type Record = zod.infer<typeof Record>;

const Results = zod.array(Record);

type Results = zod.infer<typeof Results>;

const SelfTestRecord = zod.object({
  day: zod.string(),
  file: zod.string(),
  answer1: zod.string(),
  answer2: zod.string(),
});

type SelfTestRecord = zod.infer<typeof SelfTestRecord>;

const SelfTestData = zod.array(SelfTestRecord);

type SelfTestData = zod.infer<typeof SelfTestData>;

interface SetResultParams {
  day: number;
  result1: boolean;
  result2: boolean;
  time: number;
}

function setResult(data: Map<number, Record>, params: SetResultParams) {
  const { day, result1, result2, time } = params;
  let row = data.get(day);
  if (!row) {
    row = { day: String(day), title: "", result1: "", result2: "", time: "" };
    data.set(day, row);
  }
  row.result1 = result1 ? "\u2705" : "\u274C";
  row.result2 = result2 ? "\u2705" : "\u274C";
  row.time = `${time.toFixed(0)}ms`;
}

async function main() {
  const args = arg({
    "--day": [Number],
    "--test-location": String,
    "-t": "--test-location",
    "-d": "--day",
  });

  const days = args["--day"];
  const testFile = args["--test-location"];

  assert(days, "day(s) must be provided (-d/--day)");
  assert(testFile, "path to test .csv must be provided (-t/--test-location)");

  const results = await fsp
    .readFile("times.csv", "utf-8")
    .then(($) =>
      csv.parse($, { columns: ["day", "title", "result1", "result2", "time"] }),
    )
    .then(($) => Results.parse($))
    .then(($) =>
      $.reduce((acc, record) => {
        acc.set(Number(record.day), record);
        return acc;
      }, new Map<number, Record>()),
    );

  const tests = await fsp
    .readFile(testFile, "utf-8")
    .then(($) =>
      csv.parse($, { columns: ["day", "file", "answer1", "answer2"] }),
    )
    .then(($) => SelfTestData.parse($))
    .then(($) =>
      $.reduce((acc, record) => {
        acc.set(Number(record.day), record);
        return acc;
      }, new Map<number, SelfTestRecord>()),
    );

  for (const day of days) {
    const test = tests.get(day);
    if (!test) {
      throw new Error(`No test exists for day #${day}`);
    }
    const solver = solvers.get(day);
    if (!solver) {
      setResult(results, { day, result1: false, result2: false, time: 0 });
      continue;
    }
    const inputLocation = p.join(p.dirname(testFile), test.file);
    const input = await fsp.readFile(inputLocation, "utf-8");
    const start = process.hrtime.bigint();
    const p1answer = await solver.partOne(input);
    const p2answer = await solver.partTwo(input);
    const end = process.hrtime.bigint();
    const tdiff = Number((end - start) / 1_000_000n);
    const result1 = String(p1answer) === test.answer1;
    const result2 = String(p2answer) === test.answer2;
    setResult(results, { day, result1, result2, time: tdiff });
  }

  const newResultsCSV =
    [...results]
      .sort(([a], [b]) => a - b)
      .map(
        ([, record]) =>
          `${record.day},${record.title},${record.result1},${record.result2},${record.time}`,
      )
      .join("\n") + "\n";

  await fsp.writeFile("times.csv", newResultsCSV);

  const newAdocCSV = [...results]
    .sort(([a], [b]) => a - b)
    .map(
      ([, record]) =>
        `${record.title},${record.result1},${record.result2},${record.time}`,
    )
    .join("\n");

  const template = await fsp.readFile("README.template.adoc", "utf-8");
  const adoc = template.replaceAll("--SELFTEST-DATA--", newAdocCSV);
  await fsp.copyFile("README.adoc", "README.adoc.bak");
  await fsp.writeFile("README.adoc", adoc);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
