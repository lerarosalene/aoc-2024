import assert from "node:assert";
import { lines } from "../../common/utils";
import { Formula, isOperator, Wire } from "./common";
import { compile, evaluate } from "./compile";
import { FormulaLookup } from "./lookup";

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

function validateChainAdder(formulas: FormulaLookup, adder: number) {
  const index = adder.toString().padStart(2, "0");
  const x = `x${index}`;
  const y = `y${index}`;
  const z = `z${index}`;
  const m = formulas.findRhs(x, y, "XOR");
  const n = formulas.findRhs(x, y, "AND");
  if (!m || !n) {
    return false;
  }
  const prevCarry = formulas.findOperand(m, "XOR", z);
  if (!prevCarry) {
    return false;
  }
  const r = formulas.findRhs(prevCarry, m, "AND");
  if (!r) {
    return false;
  }
  const carryOut = formulas.findRhs(r, n, "OR");
  if (!carryOut) {
    return false;
  }
  return true;
}

function validateLastAdder(formulas: FormulaLookup, adder: number) {
  const index = adder.toString().padStart(2, "0");
  const z = `z${index}`;
  const [carryInLeft, carryInRight] = formulas.findOperands("OR", z) ?? [];
  if (!carryInLeft || !carryInRight) {
    return false;
  }
  return true;
}

function validateFirstAdder(formulas: FormulaLookup, adder: number) {
  const index = adder.toString().padStart(2, "0");
  const x = `x${index}`;
  const y = `y${index}`;
  const i1 = formulas.findRhs(x, y, "XOR");
  const cOut = formulas.findRhs(x, y, "AND");
  if (i1 !== `z${index}` || !cOut) {
    return false;
  }
  return true;
}

function validateAdder(formulas: FormulaLookup, adder: number, total: number) {
  return adder === 0
    ? validateFirstAdder(formulas, adder)
    : adder === total - 1
      ? validateLastAdder(formulas, adder)
      : validateChainAdder(formulas, adder);
}

function getInvalidAdders(formulas: FormulaLookup, total: number) {
  let result: number[] = [];
  for (let i = 0; i < total; ++i) {
    if (validateAdder(formulas, i, total)) {
      continue;
    }
    result.push(i);
  }
  return result;
}

export function partTwo(input: string) {
  const { formulas } = parse(input);
  const lookup = new FormulaLookup(formulas);
  const invalidAdders = getInvalidAdders(lookup, 46);
  const swapCandidates = formulas.map((f) => f.result);

  let fixes = new Map<number, [string, string]>();
  for (let i = 0; i < swapCandidates.length; ++i) {
    for (let j = i + 1; j < swapCandidates.length; ++j) {
      lookup.setSwaps([[swapCandidates[i], swapCandidates[j]]]);
      const newInvalid = getInvalidAdders(lookup, 46);
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
