import assert from "node:assert";
import { lines } from "../../common/utils";
import { getSolution } from "./db";

export function partOne(input: string) {
  const combos = lines(input);
  let result = 0;
  for (let combo of combos) {
    const length = getSolution(combo, 2);
    if (length === undefined) {
      return "error: db doesn't contain answer for this combo";
    }
    const numeric = Number(combo.slice(0, -1));
    result += length * numeric;
  }
  return result;
}

export function partTwo(input: string) {
  const combos = lines(input);
  let result = 0;
  for (let combo of combos) {
    const length = getSolution(combo, 25);
    if (length === undefined) {
      return "error: db doesn't contain answer for this combo";
    }
    const numeric = Number(combo.slice(0, -1));
    result += length * numeric;
  }
  return result;
}
