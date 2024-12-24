import { x, y, z } from "./common";
import { FormulaLookup } from "./lookup";

function validateChainAdder(formulas: FormulaLookup, adder: number) {
  const m = formulas.findRhs(x(adder), y(adder), "XOR");
  const n = formulas.findRhs(x(adder), y(adder), "AND");
  if (!m || !n) {
    return null;
  }
  const prevCarry = formulas.findOperand(m, "XOR", z(adder));
  if (!prevCarry) {
    return null;
  }
  const r = formulas.findRhs(prevCarry, m, "AND");
  if (!r) {
    return null;
  }
  const carryOut = formulas.findRhs(r, n, "OR");
  if (!carryOut) {
    return null;
  }
  return [z(adder), m, n, r, carryOut];
}

function validateLastAdder(formulas: FormulaLookup, adder: number) {
  const [carryInLeft, carryInRight] =
    formulas.findOperands("OR", z(adder)) ?? [];
  if (!carryInLeft || !carryInRight) {
    return null;
  }
  return [carryInLeft, carryInRight, z(adder)];
}

function validateFirstAdder(formulas: FormulaLookup, adder: number) {
  const i1 = formulas.findRhs(x(adder), y(adder), "XOR");
  const cOut = formulas.findRhs(x(adder), y(adder), "AND");
  if (i1 !== z(adder) || !cOut) {
    return null;
  }
  return [i1, cOut];
}

function validateAdder(formulas: FormulaLookup, adder: number, total: number) {
  return adder === 0
    ? validateFirstAdder(formulas, adder)
    : adder === total - 1
      ? validateLastAdder(formulas, adder)
      : validateChainAdder(formulas, adder);
}

interface ValidationResultCollect {
  invalid: Set<number>;
  correct: Set<string>;
}

interface ValidationResultValidOnly {
  invalid: Set<number>;
}

export function validateAdders(
  formulas: FormulaLookup,
  total: number,
  collectFixedBits: true,
): ValidationResultCollect;

export function validateAdders(
  formulas: FormulaLookup,
  total: number,
  collectFixedBits: false,
): ValidationResultValidOnly;

export function validateAdders(
  formulas: FormulaLookup,
  total: number,
  collectFixedBits: boolean,
) {
  let result = new Set<number>();
  let correct = new Set<string>();
  for (let i = 0; i < total; ++i) {
    let valids: string[] | null = null;
    if ((valids = validateAdder(formulas, i, total))) {
      if (collectFixedBits) {
        for (const valid of valids) {
          correct.add(valid);
        }
      }
      continue;
    }
    result.add(i);
  }
  return collectFixedBits ? { invalid: result, correct } : { invalid: result };
}
