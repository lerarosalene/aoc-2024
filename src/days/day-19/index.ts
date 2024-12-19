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

class Solver {
  private cache = new Map<string, number>();
  constructor(private patterns: string[]) {}

  count(design: string, checkOnly: boolean): number {
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
        let result = this.count(design.slice(pattern.length), checkOnly);
        if (checkOnly && result > 0) {
          this.cache.set(design, 1);
          return 1;
        }
        total += result;
      }
    }
    this.cache.set(design, total);
    return total;
  }
}

export function partOne(input: string) {
  const { patterns, designs } = parse(input);
  const solver = new Solver(patterns);
  return designs.filter((design) => solver.count(design, true) > 0).length;
}

export function partTwo(input: string) {
  const { patterns, designs } = parse(input);
  const solver = new Solver(patterns);
  return designs
    .map((design) => solver.count(design, false))
    .reduce((a, b) => a + b, 0);
}
