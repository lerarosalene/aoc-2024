import fs from "node:fs";
import p from "node:path";
import { Solver } from "./solver";

const fsp = fs.promises;

async function main() {
  const solver = new Solver();
  const entries: [string, number][] = [];
  for (let i = 0; i < 1000; ++i) {
    for (let depth of [2, 25]) {
      const combo = `${i.toString().padStart(3, "0")}A`;
      const result = solver.solve(combo, depth, 0);
      entries.push([`${combo}:${depth}`, result]);
    }
  }

  const contents = JSON.stringify(entries, null, 2);
  const path = p.join("src", "days", "day-21", "db.json");
  await fsp.writeFile(path, contents);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
