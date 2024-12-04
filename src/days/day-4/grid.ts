import assert from "assert";

export enum Direction {
  N,
  E,
  S,
  W,
  NE,
  SE,
  SW,
  NW,
}

export const DIRECTIONS = [
  Direction.N,
  Direction.E,
  Direction.S,
  Direction.W,
  Direction.NE,
  Direction.SE,
  Direction.SW,
  Direction.NW,
];
assert(new Set(DIRECTIONS).size === 8, "there are 8 unique directions");

export interface Difference {
  x: number;
  y: number;
}

export function difference(direction: Direction): Difference {
  switch (direction) {
    case Direction.N:
      return { x: 0, y: -1 };
    case Direction.E:
      return { x: 1, y: 0 };
    case Direction.S:
      return { x: 0, y: 1 };
    case Direction.W:
      return { x: -1, y: 0 };
    case Direction.NE:
      return { x: 1, y: -1 };
    case Direction.SE:
      return { x: 1, y: 1 };
    case Direction.SW:
      return { x: -1, y: 1 };
    case Direction.NW:
      return { x: -1, y: -1 };
    default:
      const _exhaust: never = direction;
      _exhaust;
      throw new Error("Impossible code path");
  }
}

export class Grid {
  private _chars: string[][];

  constructor(input: string) {
    this._chars = input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) =>
        line
          .split("")
          .map((c) => c.trim())
          .filter((c) => c.length > 0),
      );
    const lineLength = new Set(this._chars.map((l) => l.length));
    assert(lineLength.size === 1, "every line should have the same length");
  }

  public at(x: number, y: number): string | null {
    return this._chars[x]?.[y] ?? null;
  }

  public get width() {
    return this._chars.length;
  }

  public get height() {
    return this._chars[0].length;
  }
}
