import assert from "node:assert";
import { clone, isCloneable } from "./cloneable";
import { lines } from "./utils";

interface IterationResult<T> {
  x: number;
  y: number;
  value: T;
}

export class ContinousGrid<T> {
  private _items: T[];
  private _width: number;
  private _height: number;

  constructor(width: number, height: number, items: T[]) {
    assert.equal(width * height, items.length);
    this._items = items;
    this._width = width;
    this._height = height;
  }

  public at(x: number, y: number) {
    if (x >= this._width || x < 0) {
      return null;
    }
    if (y >= this._height || y < 0) {
      return null;
    }
    return this._items[y * this._width + x] ?? null;
  }

  public set(x: number, y: number, value: T) {
    if (x >= this._width || x < 0) {
      throw new RangeError(`${x}:${y} is not a valid position on the grid`);
    }
    if (y >= this._height || y < 0) {
      throw new RangeError(`${x}:${y} is not a valid position on the grid`);
    }
    this._items[y * this._width + x] = value;
  }

  public get width() {
    return this._width;
  }

  public get height() {
    return this._height;
  }

  public clone(): ContinousGrid<T> {
    return new ContinousGrid(
      this._width,
      this._height,
      this._items.map((item) => (isCloneable(item) ? item[clone]() : item)),
    );
  }

  public static parseCharGrid(input: string): ContinousGrid<string> {
    const ls = lines(input);
    const lengths = new Set(ls.map((line) => line.length));
    assert.equal(lengths.size, 1, "input is rectangle");
    const data = ls.join("");
    return new ContinousGrid(ls[0].length, ls.length, data.split(""));
  }

  public [clone]() {
    return this.clone();
  }

  public toString() {
    let lines = [];
    for (let y = 0; y < this.height; ++y) {
      let line = "";
      for (let x = 0; x < this.width; ++x) {
        line += this.at(x, y);
      }
      lines.push(line);
    }
    return lines.join("\n");
  }

  *[Symbol.iterator](): Generator<IterationResult<T>> {
    for (let x = 0; x < this.width; ++x) {
      for (let y = 0; y < this.height; ++y) {
        yield { x, y, value: this._items[y * this._width + x] };
      }
    }
  }
}
