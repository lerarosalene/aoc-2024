import assert from "assert";
import { IGrid } from "../../../common/grid";
import { Point } from "../../../common/point";
import { getKeypad, KeypadType } from "../keypad";

export interface Target {
  command(button: string): void;
}

export class Keypad implements Target {
  private _contents = "";

  public get contents() {
    return this._contents;
  }

  public command(button: string): void {
    this._contents += button;
  }
}

export class Robot implements Target {
  private _grid: IGrid<string>;
  private _position: Point;
  private _button: string;
  private _next: Target | null = null;
  private _highlighted = false;

  public get highlighted() {
    return this._highlighted;
  }

  public get button() {
    return this._button;
  }

  public get grid() {
    return this._grid;
  }

  constructor(type: KeypadType, button: string) {
    this._grid = getKeypad(type);
    let position: Point | null = null;
    for (let x = 0; x < this._grid.width; ++x) {
      for (let y = 0; y < this._grid.height; ++y) {
        if (this._grid.at(x, y) === button) {
          position = { x, y };
        }
      }
    }
    assert(position, "button exists on keypad");
    this._position = position;
    this._button = button;
  }

  public connect(next: Target) {
    this._next = next;
  }

  public command(button: string) {
    if (button === "A") {
      this._highlighted = true;
      assert(this._next, "robot is connected");
      this._next.command(this._button);
      return;
    }
    const direction = Robot._getDirection(button);
    const newPosition = {
      x: this._position.x + direction.x,
      y: this._position.y + direction.y,
    };
    const newButton = this._grid.at(newPosition.x, newPosition.y);
    assert(newButton, "button exists at position");
    this._position = newPosition;
    this._button = newButton;
  }

  public resetHighlight() {
    this._highlighted = false;
  }

  private static _getDirection(button: string): Point {
    switch (button) {
      case "<":
        return { x: -1, y: 0 };
      case ">":
        return { x: 1, y: 0 };
      case "^":
        return { x: 0, y: -1 };
      case "v":
        return { x: 0, y: 1 };
      default:
        throw new Error(`Unexpected button "${button}"`);
    }
  }
}
