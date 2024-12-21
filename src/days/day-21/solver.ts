import { KeypadType } from "./keypad";
import { KeypadPathFinder } from "./path";

export function* cartesian<T>(
  arrays: Array<Array<T>>,
): IterableIterator<Array<T>> {
  if (arrays.length === 0) {
    return;
  }
  if (arrays.length === 1) {
    for (let item of arrays[0]) {
      yield [item];
    }
  }
  for (let item of arrays[0]) {
    for (let rest of cartesian(arrays.slice(1))) {
      yield [item, ...rest];
    }
  }
}

export class Solver {
  private _pathfinder = new KeypadPathFinder();
  private _cache = new Map<string, number>();

  public solve(sequence: string, maxDepth: number, depth: number) {
    const key = Solver.cacheKey(sequence, maxDepth, depth);
    const cached = this._cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    if (depth === maxDepth + 1) {
      this._cache.set(key, sequence.length);
      return sequence.length;
    }

    let segments: string[] = sequence
      .split("A")
      .slice(0, -1)
      .map((segment) => `${segment}A`);

    let result = 0;
    for (let segment of segments) {
      let fragments: Array<string[]> = [];
      fragments.push(
        this._pathfinder.findPath(
          "A",
          segment[0],
          depth === 0 ? KeypadType.NUMERIC : KeypadType.DIRECTIONAL,
        ),
      );
      for (let i = 1; i < segment.length; ++i) {
        fragments.push(
          this._pathfinder.findPath(
            segment[i - 1],
            segment[i],
            depth === 0 ? KeypadType.NUMERIC : KeypadType.DIRECTIONAL,
          ),
        );
      }

      let minLength = Infinity;
      for (let nextSegmentFragments of cartesian(fragments)) {
        const full = nextSegmentFragments.join("A") + "A";
        const length = this.solve(full, maxDepth, depth + 1);
        if (length < minLength) {
          minLength = length;
        }
      }
      result += minLength;
    }

    this._cache.set(key, result);
    return result;
  }

  private static cacheKey(sequence: string, maxDepth: number, depth: number) {
    return `${sequence}:${maxDepth}:${depth}`;
  }
}
