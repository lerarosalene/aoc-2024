import assert from "../../vendor/assert";
import { KeypadType } from "./keypad";
import { KeypadPathFinder } from "./path";

export class Solver {
  private _pathfinder = new KeypadPathFinder();
  private _cache = new Map<string, number>();

  public solveButton(
    previousButton: string,
    button: string,
    maxDepth: number,
    depth: number,
  ) {
    const key = Solver.sbKey(previousButton, button, maxDepth, depth);
    const cached = this._cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const paths = this._pathfinder.findPath(
      previousButton,
      button,
      depth === 0 ? KeypadType.NUMERIC : KeypadType.DIRECTIONAL,
    );
    let minLength = Infinity;
    for (const path of paths) {
      const length = this.solve(path + "A", maxDepth, depth + 1);
      if (length < minLength) {
        minLength = length;
      }
    }
    assert(minLength !== Infinity, "solution exists");
    this._cache.set(key, minLength);
    return minLength;
  }

  public solve(sequence: string, maxDepth: number, depth: number): number {
    if (depth === maxDepth + 1) {
      return sequence.length;
    }
    if (sequence.length === 0) {
      return 0;
    }
    let result = 0;
    result += this.solveButton("A", sequence[0], maxDepth, depth);
    for (let i = 1; i < sequence.length; ++i) {
      result += this.solveButton(sequence[i - 1], sequence[i], maxDepth, depth);
    }
    return result;
  }

  private static sbKey(
    pb: string,
    button: string,
    maxDepth: number,
    depth: number,
  ) {
    return `${pb}:${button}:${maxDepth}:${depth}`;
  }
}
