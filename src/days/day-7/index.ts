import { lines } from "../../common/utils";

interface Equation {
  result: number;
  operands: number[];
}

type Op = (a: number, b: number) => number;

const operations: Op[] = [
  (a: number, b: number) => a * Math.pow(10, Math.ceil(Math.log10(b + 1))) + b,
  (a: number, b: number) => a * b,
  (a: number, b: number) => a + b,
];

const operationsP1 = operations.slice(1);

function solveHelper(
  equation: Equation,
  useConcat: boolean,
  current: number,
  currentIndex: number,
) {
  if (current > equation.result) {
    return false;
  }

  if (
    currentIndex === equation.operands.length &&
    current === equation.result
  ) {
    return true;
  }

  if (currentIndex === equation.operands.length) {
    return false;
  }

  for (const op of useConcat ? operations : operationsP1) {
    if (
      solveHelper(
        equation,
        useConcat,
        op(current, equation.operands[currentIndex]),
        currentIndex + 1,
      )
    ) {
      return true;
    }
  }

  return false;
}

function solve(equation: Equation, useConcat: boolean) {
  return solveHelper(equation, useConcat, equation.operands[0], 1);
}

function parse(input: string) {
  const ls = lines(input);
  return ls.map<Equation>((line) => {
    const [resRaw, operandsRaw] = line.split(":");
    const result = Number(resRaw);
    const operands = operandsRaw
      .split(/\s+/g)
      .map((op) => op.trim())
      .filter((op) => op.length > 0)
      .map((op) => Number(op));
    return { result, operands };
  });
}

export function partOne(input: string) {
  const equations = parse(input);
  const solvable = equations.filter((eq) => solve(eq, false));
  return solvable.reduce((acc, eq) => acc + eq.result, 0);
}

export function partTwo(input: string) {
  const equations = parse(input);
  const solvable = equations.filter((eq) => solve(eq, true));
  return solvable.reduce((acc, eq) => acc + eq.result, 0);
}
