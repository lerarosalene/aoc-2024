import assert from "node:assert";
import { Point } from "../../common/point";

interface Machine {
  a: Point;
  b: Point;
  prize: Point;
}

function parseMachine(section: string): Machine {
  const [aLine, bLine, prizeLine] = section
    .split("\n")
    .map((i) => i.trim())
    .filter((i) => i.length > 0);

  const aMatch = aLine.match(/Button A: X\+(\d+), Y\+(\d+)/);
  const bMatch = bLine.match(/Button B: X\+(\d+), Y\+(\d+)/);
  const pMatch = prizeLine.match(/Prize: X=(\d+), Y=(\d+)/);

  assert(aMatch, "Button A line is correct");
  assert(bMatch, "Button B line is correct");
  assert(pMatch, "Prize line is correct");

  const a: Point = { x: Number(aMatch[1]), y: Number(aMatch[2]) };
  const b: Point = { x: Number(bMatch[1]), y: Number(bMatch[2]) };
  const prize: Point = { x: Number(pMatch[1]), y: Number(pMatch[2]) };
  return { a, b, prize };
}

function parse(input: string) {
  const sections = input
    .split("\n\n")
    .map((i) => i.trim())
    .filter((i) => i.length > 0);

  return sections.map(parseMachine);
}

const P2_OFFSET = 10_000_000_000_000;

function correctMachineP2(machine: Machine): Machine {
  return {
    a: {
      x: machine.a.x,
      y: machine.a.y,
    },
    b: {
      x: machine.b.x,
      y: machine.b.y,
    },
    prize: {
      x: machine.prize.x + P2_OFFSET,
      y: machine.prize.y + P2_OFFSET,
    },
  };
}

function solve(machine: Machine): { a: number; b: number } | null {
  const bNum = machine.prize.y * machine.a.x - machine.a.y * machine.prize.x;
  const bDen = machine.b.y * machine.a.x - machine.a.y * machine.b.x;
  if (bNum === 0 && bDen === 0) {
    throw new Error("0/0 encountered, infinitely many solutions");
  }
  const b = Math.round(bNum / bDen);
  if (b * bDen !== bNum) {
    return null; // real b is fractional
  }
  const aNum = machine.prize.x - b * machine.b.x;
  const aDen = machine.a.x;
  if (aNum === 0 && aDen === 0) {
    throw new Error("0/0 encountered, infinitely many solutions");
  }
  const a = Math.round(aNum / aDen);
  if (a * aDen !== aNum) {
    return null; // real a is fractional
  }
  if (a < 0 || b < 0) {
    return null;
  }
  return { a, b };
}

function exists<T>(input: T | null | undefined): input is T {
  return input !== null && input !== undefined;
}

export function partOne(input: string) {
  const machines = parse(input);
  return machines
    .map(solve)
    .filter(exists)
    .filter(({ a, b }) => a <= 100 && b <= 100)
    .map(({ a, b }) => a * 3 + b)
    .reduce((a, b) => a + b, 0);
}

export function partTwo(input: string) {
  const machines = parse(input);
  const corrected = machines.map(correctMachineP2);
  return corrected
    .map(solve)
    .filter(exists)
    .map(({ a, b }) => a * 3 + b)
    .reduce((a, b) => a + b, 0);
}
