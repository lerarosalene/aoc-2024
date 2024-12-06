import { DIRECTIONS, Direction, Grid, difference } from "../../common/grid";

class SolverP1 {
  private _grid: Grid;

  constructor(grid: Grid) {
    this._grid = grid;
  }

  public find() {
    let result = 0;
    for (let x = 0; x < this._grid.width; ++x) {
      for (let y = 0; y < this._grid.height; ++y) {
        for (let d of DIRECTIONS) {
          if (this._scan(x, y, d)) {
            result += 1;
          }
        }
      }
    }
    return result;
  }

  private _scan(x: number, y: number, d: Direction): boolean {
    const diff = difference(d);
    const locs = [0, 1, 2, 3].map((amount) => ({
      x: x + amount * diff.x,
      y: y + amount * diff.y,
    }));
    const letters = locs.map((loc) => this._grid.at(loc.x, loc.y));
    if (letters.some((l) => l === null)) {
      return false;
    }
    const word = letters.join("");
    return word === "XMAS";
  }
}

class SolverP2 {
  private _grid: Grid;

  constructor(grid: Grid) {
    this._grid = grid;
  }

  public find() {
    let result = 0;
    for (let x = 0; x < this._grid.width; ++x) {
      for (let y = 0; y < this._grid.height; ++y) {
        if (this._scan(x, y)) {
          result += 1;
        }
      }
    }
    return result;
  }

  private _scan(x: number, y: number): boolean {
    const d1 = difference(Direction.SE);
    const d2 = difference(Direction.SW);

    const locs1 = [0, 1, 2].map((amount) => ({
      x: x + amount * d1.x,
      y: y + amount * d1.y,
    }));
    const locs2 = [0, 1, 2].map((amount) => ({
      x: x + 2 + amount * d2.x,
      y: y + amount * d2.y,
    }));
    const letters1 = locs1.map((loc) => this._grid.at(loc.x, loc.y));
    const letters2 = locs2.map((loc) => this._grid.at(loc.x, loc.y));

    if (letters1.some((l) => l === null) || letters2.some((l) => l === null)) {
      return false;
    }

    const word1 = letters1.join("");
    const word2 = letters2.join("");

    return (
      (word1 === "MAS" || word1 === "SAM") &&
      (word2 === "MAS" || word2 === "SAM")
    );
  }
}

export function partOne(input: string) {
  const grid = new Grid(input);
  const solver = new SolverP1(grid);
  return solver.find();
}

export function partTwo(input: string) {
  const grid = new Grid(input);
  const solver = new SolverP2(grid);
  return solver.find();
}
