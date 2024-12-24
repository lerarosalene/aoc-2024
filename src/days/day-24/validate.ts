import { FormulaLookup } from "./lookup";

function validateChainAdder(formulas: FormulaLookup, adder: number) {
  const index = adder.toString().padStart(2, "0");
  const x = `x${index}`;
  const y = `y${index}`;
  const z = `z${index}`;
  const m = formulas.findRhs(x, y, "XOR");
  const n = formulas.findRhs(x, y, "AND");
  if (!m || !n) {
    return null;
  }
  const prevCarry = formulas.findOperand(m, "XOR", z);
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
  return [z, m, n, r, carryOut];
}

function validateLastAdder(formulas: FormulaLookup, adder: number) {
  const index = adder.toString().padStart(2, "0");
  const z = `z${index}`;
  const [carryInLeft, carryInRight] = formulas.findOperands("OR", z) ?? [];
  if (!carryInLeft || !carryInRight) {
    return null;
  }
  return [carryInLeft, carryInRight, z];
}

function validateFirstAdder(formulas: FormulaLookup, adder: number) {
  const index = adder.toString().padStart(2, "0");
  const x = `x${index}`;
  const y = `y${index}`;
  const i1 = formulas.findRhs(x, y, "XOR");
  const cOut = formulas.findRhs(x, y, "AND");
  if (i1 !== `z${index}` || !cOut) {
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
