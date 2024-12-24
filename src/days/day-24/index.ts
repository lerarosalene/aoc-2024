import assert from "node:assert";
import { lines } from "../../common/utils";
import { Formula, isOperator, Wire } from "./common";
import { compile, evaluate } from "./compile";
import { FormulaLookup } from "./lookup";
import { validateAdders } from "./validate";

function parseWires(wires: string) {
  return lines(wires).map((line): Wire => {
    const [name, value] = line.split(":").map((p) => p.trim());
    return { name, value: Boolean(Number(value)) };
  });
}

const FORMULA_REGEX = /^(\S+)\s+(\S+)\s+(\S+)\s+->\s+(\S+)$/;

function parseFormulas(formulas: string) {
  return lines(formulas).map((line): Formula => {
    const match = line.match(FORMULA_REGEX);
    assert(match);
    const left = match[1];
    const right = match[3];
    const op = match[2];
    const result = match[4];
    assert(isOperator(op));
    return {
      left,
      right,
      result,
      operator: op,
    };
  });
}

function parse(input: string) {
  const [initial, formulas] = input.split("\n\n");
  return { wires: parseWires(initial), formulas: parseFormulas(formulas) };
}

export function partOne(input: string) {
  const { wires, formulas } = parse(input);
  const resolver = compile(formulas);

  return evaluate(resolver, wires);
}

export function partTwo(input: string) {
  const { formulas } = parse(input);
  const lookup = new FormulaLookup(formulas);
  const { invalid: invalidAdders, correct } = validateAdders(lookup, 46, true);
  const swapCandidates = formulas
    .map((f) => f.result)
    .filter((wire) => !correct.has(wire));

  let fixes = new Map<number, [string, string]>();
  for (let i = 0; i < swapCandidates.length; ++i) {
    for (let j = i + 1; j < swapCandidates.length; ++j) {
      lookup.setSwaps([[swapCandidates[i], swapCandidates[j]]]);
      const { invalid: newInvalid } = validateAdders(lookup, 46, false);
      const newInvalidSet = new Set(newInvalid);
      for (const invalid of invalidAdders) {
        if (!newInvalidSet.has(invalid)) {
          fixes.set(invalid, [swapCandidates[i], swapCandidates[j]]);
        }
      }
    }
  }

  return fixes
    .values()
    .reduce((a, b) => [...a, ...b], [] as string[])
    .sort()
    .join();
}
