import fs from "node:fs";
import * as csv from "csv-parse/sync";
import zod from "zod";

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

const TOTAL_TITLE = "Total";

async function main() {
  let total = 0;
  const records = await fsp
    .readFile("times.csv", "utf-8")
    .then(($) =>
      csv.parse($, { columns: ["day", "title", "result1", "result2", "time"] }),
    )
    .then(($) => Results.parse($))
    .then(($) => {
      $.forEach((record) => (total += Number(record.time)));
      return $;
    })
    .then(($) => $.map((record) => ({ ...record, time: record.time + "ms" })));

  type Key = keyof (typeof records)[0];

  const padStart = new Set<Key>(["time"]);
  const columns: Array<Key> = ["title", "time"];
  const totalTime = `${total}ms`;
  let widths = new Map<string, number>();
  widths.set("title", TOTAL_TITLE.length);
  widths.set("time", totalTime.length);
  for (let column of columns) {
    for (let record of records) {
      widths.set(
        column,
        Math.max(widths.get(column) ?? 0, record[column].length),
      );
    }
  }

  let result: string[] = [];
  for (let record of records) {
    let row = [];
    for (const column of columns) {
      const padder = padStart.has(column)
        ? String.prototype.padStart
        : String.prototype.padEnd;
      row.push(padder.call(record[column], widths.get(column) ?? 0, "."));
    }
    result.push(row.join(".."));
  }

  result.push(
    [
      TOTAL_TITLE.padEnd(widths.get("title") ?? 0, "."),
      totalTime.padStart(widths.get("time") ?? 0, "."),
    ].join(".."),
  );
  console.log(result.join("\n"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
