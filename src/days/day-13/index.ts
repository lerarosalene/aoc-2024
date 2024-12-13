import assert from "node:assert";

interface BigPoint {
  x: bigint;
  y: bigint;
}

interface Machine {
  a: BigPoint;
  b: BigPoint;
  prize: BigPoint;
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
  assert(bMatch, "Button A line is correct");
  assert(pMatch, "Button A line is correct");

  const a: BigPoint = { x: BigInt(aMatch[1]), y: BigInt(aMatch[2]) };
  const b: BigPoint = { x: BigInt(bMatch[1]), y: BigInt(bMatch[2]) };
  const prize: BigPoint = { x: BigInt(pMatch[1]), y: BigInt(pMatch[2]) };
  return { a, b, prize };
}

function parse(input: string) {
  const sections = input
    .split("\n\n")
    .map((i) => i.trim())
    .filter((i) => i.length > 0);

  return sections.map(parseMachine);
}

const P2_OFFSET = 10_000_000_000_000n;

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

function solve(machine: Machine): { a: bigint; b: bigint } | null {
  try {
    const bNum = machine.prize.y * machine.a.x - machine.a.y * machine.prize.x;
    const bDen = machine.b.y * machine.a.x - machine.a.y * machine.b.x;
    const b = bNum / bDen;
    if (b * bDen !== bNum) {
      return null; // real b is fractional
    }
    const aNum = machine.prize.x - b * machine.b.x;
    const aDen = machine.a.x;
    const a = aNum / aDen;
    if (a * aDen !== aNum) {
      return null; // real a is fractional
    }
    if (a < 0n || b < 0n) {
      return null;
    }
    return { a, b };
  } catch (error) {
    // division by zero
    return null;
  }
}

function exists<T>(input: T | null | undefined): input is T {
  return input !== null && input !== undefined;
}

export function partOne(input: string) {
  const machines = parse(input);
  return machines
    .map(solve)
    .filter(exists)
    .filter(({ a, b }) => a <= 100n && b <= 100n)
    .map(({ a, b }) => a * 3n + b)
    .reduce((a, b) => a + b, 0n);
}

export function partTwo(input: string) {
  const machines = parse(input);
  const corrected = machines.map(correctMachineP2);
  return corrected
    .map(solve)
    .filter(exists)
    .map(({ a, b }) => a * 3n + b)
    .reduce((a, b) => a + b, 0n);
}
