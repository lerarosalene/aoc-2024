import assert from "node:assert";
import { lines } from "../../common/utils";
import { Formula, isOperator, Wire } from "./common";
import { FormulaLookup } from "./lookup";
import { validateAdders } from "./validate";
import { compile } from "./compile";

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

export function parse(input: string) {
  const [initial, formulas] = input.split("\n\n");
  return { wires: parseWires(initial), formulas: parseFormulas(formulas) };
}

export function partOne(input: string) {
  const { wires, formulas } = parse(input);
  const f = compile(formulas);
  const inputs = wires.reduce(
    (acc, wire) => {
      acc[wire.name] = wire.value;
      return acc;
    },
    {} as Partial<Record<string, boolean>>,
  );

  const outputs = f(inputs);
  let result = 0;
  for (let i = 45; i >= 0; --i) {
    result =
      result * 2 + (outputs[`z${i.toString().padStart(2, "0")}`] ? 1 : 0);
  }

  return result;
}

export function partTwo(input: string) {
  const { formulas } = parse(input);
  const lookup = new FormulaLookup(formulas);
  const { invalid: invalidAdders, correct } = validateAdders(lookup, 46, true);
  const swapCandidates = formulas
    .map((f) => f.result)
    .filter((wire) => !correct.has(wire));

  let fixes = new Map<number, [string, string]>();
  let tried = new Set<string>();
  for (let i = 0; i < swapCandidates.length; ++i) {
    for (let j = i + 1; j < swapCandidates.length; ++j) {
      if (tried.has(swapCandidates[i]) || tried.has(swapCandidates[j])) {
        continue;
      }
      lookup.setSwaps([[swapCandidates[i], swapCandidates[j]]]);
      const { invalid: newInvalid } = validateAdders(lookup, 46, false);
      const newInvalidSet = new Set(newInvalid);
      for (const invalid of invalidAdders) {
        if (!newInvalidSet.has(invalid)) {
          fixes.set(invalid, [swapCandidates[i], swapCandidates[j]]);
          tried.add(swapCandidates[i]);
          tried.add(swapCandidates[j]);
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
