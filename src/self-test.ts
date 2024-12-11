import fs from "node:fs";
import p from "node:path";
import assert from "node:assert";
import * as csv from "csv-parse/sync";
import zod from "zod";
import chalk from "chalk";
import { days } from "./days";

const fsp = fs.promises;

const Record = zod.object({
  day: zod.string(),
  file: zod.string(),
  answer1: zod.string(),
  answer2: zod.string(),
});

type Record = zod.infer<typeof Record>;
const Data = zod.array(Record);
type Data = zod.infer<typeof Data>;

function log(day: number, results: string[], time: number) {
  assert.equal(results.length, 2, "`results` has 2 elements");
  console.log(
    `Day ${String(day).padStart(2, " ")}: ${results[0]}, ${results[1]} - ${time.toFixed(0)}ms`,
  );
}

interface ReportEntry {
  day: number;
  partOne: boolean;
  partTwo: boolean;
  time: number;
  current: number;
  total: number;
}

export async function* generateReport(
  fullFile: string,
): AsyncGenerator<ReportEntry> {
  const raw = await fsp.readFile(fullFile, "utf-8");
  const data = Data.parse(
    csv.parse(raw, { columns: ["day", "file", "answer1", "answer2"] }),
  );

  for (let i = 0; i < data.length; ++i) {
    const { day, file, answer1, answer2 } = data[i];
    const solver = days.get(+day);
    if (!solver) {
      yield {
        day: +day,
        partOne: false,
        partTwo: false,
        time: 0,
        current: i + 1,
        total: data.length,
      };
      continue;
    }
    const input = await fsp.readFile(
      p.join(p.dirname(fullFile), file),
      "utf-8",
    );
    const startTime = process.hrtime.bigint();
    const solverAnswer1 = await solver.partOne(input);
    const solverAnswer2 = await solver.partTwo(input);
    const endTime = process.hrtime.bigint();
    const tdiff = Number(endTime - startTime) / 1e6;
    const result1 =
      Number(solverAnswer1) === Number(answer1) &&
      !isNaN(Number(solverAnswer1));
    const result2 =
      Number(solverAnswer2) === Number(answer2) &&
      !isNaN(Number(solverAnswer2));

    yield {
      day: +day,
      partOne: result1,
      partTwo: result2,
      time: tdiff,
      current: i + 1,
      total: data.length,
    };
  }
}

const PASS_MSG = chalk.green("PASS");
const FAIL_MSG = chalk.red("FAIL");

export async function selfTest(fullFile: string) {
  for await (const day of generateReport(fullFile)) {
    log(
      day.day,
      [day.partOne, day.partTwo].map((res) => (res ? PASS_MSG : FAIL_MSG)),
      day.time,
    );
  }
}
