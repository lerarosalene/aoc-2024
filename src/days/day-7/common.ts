import assert from "node:assert";
import { lines } from "../../common/utils";

export interface Equation {
  result: bigint;
  operands: bigint[];
}

export function solve(equation: Equation, lastOp: number) {
  const operators = Array(equation.operands.length - 1)
    .fill(0);

  do {
    if (evaluate(equation, operators) === equation.result) {
      return true;
    }
  } while (goNext(operators, lastOp));

  return false;
}

export function parse(input: string) {
  const ls = lines(input);
  return ls.map<Equation>((line) => {
    const [resRaw, operandsRaw] = line.split(":");
    const result = BigInt(resRaw);
    const operands = operandsRaw
      .split(/\s+/g)
      .map((op) => op.trim())
      .filter((op) => op.length > 0)
      .map((op) => BigInt(op));
    return { result, operands };
  });
}

export function goNext(input: number[], max: number) {
  for (let i = input.length - 1; i >= 0; --i) {
    input[i]++;
    if (input[i] <= max) {
      return true;
    }
    input[i] = 0;
  }
}

export function evaluate(eq: Equation, operators: number[]) {
  assert.equal(
    eq.operands.length - 1,
    operators.length,
    "equation must be balanced",
  );
  let result = eq.operands[0];
  for (let i = 1; i < eq.operands.length; ++i) {
    const nextOperand = eq.operands[i];
    const operator = operators[i - 1];
    result =
      operator === 0
        ? result + nextOperand
        : operator === 1
          ? result * nextOperand
          : BigInt(`${result}${nextOperand}`);
  }
  return result;
}

export interface WorkerData {
  input: Equation[];
  lastOp: number;
}
