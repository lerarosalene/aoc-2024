const fs = require("node:fs");
const p = require("node:path");

const fsp = fs.promises;

const DAYS = 23;

async function main() {
  let code = [];

  for (let i = 1; i <= DAYS; ++i) {
    code.push(`import * as Day${i} from "./day-${i}";`);
  }

  code.push(
    ``,
    `type SolverResolvedResult = number | bigint | string;`,
    `type SolverResult = SolverResolvedResult | Promise<SolverResolvedResult>;`,
    ``,
    `interface Solver {`,
    `  partOne(input: string): SolverResult;`,
    `  partTwo(input: string): SolverResult;`,
    `}`,
    ``,
    `export const days = new Map<number, Solver>();`,
    ``,
  );

  for (let i = 1; i <= DAYS; ++i) {
    code.push(`days.set(${i}, Day${i});`);
  }

  code.push(``);

  const outPath = p.join("src", "days", "index.ts");
  await fsp.writeFile(outPath, code.join("\n"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
