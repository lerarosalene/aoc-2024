import { lines } from "../../common/utils";
import { Solver } from "./solver";

export function partOne(input: string) {
  const combos = lines(input);
  const solver = new Solver();
  let result = 0;
  for (let combo of combos) {
    const length = solver.solve(combo, 2, 0);
    const numeric = Number(combo.slice(0, -1));
    result += length * numeric;
  }
  return result;
}

export function partTwo(input: string) {
  const combos = lines(input);
  const solver = new Solver();
  let result = 0;
  for (let combo of combos) {
    const length = solver.solve(combo, 25, 0);
    const numeric = Number(combo.slice(0, -1));
    result += length * numeric;
  }
  return result;
}
