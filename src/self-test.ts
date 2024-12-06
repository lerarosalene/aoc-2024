import fs from "node:fs";
import p from "node:path";
import * as csv from "csv-parse/sync";
import zod from "zod";
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

function log(day: number, results: [string, string]) {
  console.log(
    `Day ${String(day).padStart(2, " ")}: ${results[0]}, ${results[1]}`,
  );
}

export async function selfTest(fullFile: string) {
  const raw = await fsp.readFile(fullFile, "utf-8");
  const data = Data.parse(
    csv.parse(raw, { columns: ["day", "file", "answer1", "answer2"] }),
  );

  for (const { day, file, answer1, answer2 } of data) {
    const solver = days.get(+day);
    if (!solver) {
      log(+day, ["NO SOLVER", "NO SOLVER"]);
      continue;
    }
    const input = await fsp.readFile(
      p.join(p.dirname(fullFile), file),
      "utf-8",
    );
    const solverAnswer1 = await solver.partOne(input);
    const solverAnswer2 = await solver.partTwo(input);
    const result1 =
      Number(solverAnswer1) === Number(answer1) &&
      !isNaN(Number(solverAnswer1));
    const result2 =
      Number(solverAnswer2) === Number(answer2) &&
      !isNaN(Number(solverAnswer2));

    log(+day, [result1 ? "OK" : "FAIL", result2 ? "OK" : "FAIL"]);
  }
}
