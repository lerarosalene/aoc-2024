import { ContinousGrid } from "../../common/continous-grid";
import { IGrid } from "../../common/grid";

const NUMERIC_GRID = ["789", "456", "123", ".0A"].join("\n");

const DIRECTIONAL_GRID = [".^A", "<v>"].join("\n");

export enum KeypadType {
  NUMERIC,
  DIRECTIONAL,
}

export function getKeypad(type: KeypadType): IGrid<string> {
  switch (type) {
    case KeypadType.NUMERIC:
      return ContinousGrid.parseCharGrid(NUMERIC_GRID);
    case KeypadType.DIRECTIONAL:
      return ContinousGrid.parseCharGrid(DIRECTIONAL_GRID);
    default:
      const _: never = type;
      throw new Error("Unreachable");
  }
}
