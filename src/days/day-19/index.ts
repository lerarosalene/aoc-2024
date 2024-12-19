import { lines } from "../../common/utils";

interface Data {
  patterns: string[];
  designs: string[];
}

function parse(input: string): Data {
  const [patterns, designs] = input.split("\n\n");

  return {
    patterns: patterns.split(",").map((p) => p.trim()),
    designs: lines(designs),
  };
}

class SolverP1 {
  private cache = new Map<string, boolean>();
  constructor(private patterns: string[]) {}

  check(design: string) {
    if (design.length === 0) {
      return true;
    }
    const cached = this.cache.get(design);
    if (cached !== undefined) {
      return cached;
    }
    for (let pattern of this.patterns) {
      if (design.startsWith(pattern)) {
        let result = this.check(design.slice(pattern.length));
        if (result) {
          this.cache.set(design, true);
          return true;
        }
      }
    }
    this.cache.set(design, false);
    return false;
  }
}

class SolverP2 {
  private cache = new Map<string, number>();
  constructor(private patterns: string[]) {}

  check(design: string): number {
    if (design.length === 0) {
      return 1;
    }
    const cached = this.cache.get(design);
    if (cached !== undefined) {
      return cached;
    }
    let total = 0;
    for (let pattern of this.patterns) {
      if (design.startsWith(pattern)) {
        total += this.check(design.slice(pattern.length));
      }
    }
    this.cache.set(design, total);
    return total;
  }
}

export function partOne(input: string) {
  const { patterns, designs } = parse(input);
  const solver = new SolverP1(patterns);
  return designs.filter((design) => solver.check(design)).length;
}

export function partTwo(input: string) {
  const { patterns, designs } = parse(input);
  const solver = new SolverP2(patterns);
  return designs
    .map((design) => solver.check(design))
    .reduce((a, b) => a + b, 0);
}
