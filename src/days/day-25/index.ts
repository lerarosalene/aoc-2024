import assert from "../../vendor/assert";
import { ContinousGrid } from "../../common/continous-grid";
import { IGrid } from "../../common/grid";

interface Item {
  type: "key" | "lock";
  columns: number[];
}

function parseItem(input: IGrid<string>): Item {
  if (input.at(0, 0) === "#") {
    let columns = [];
    for (let x = 0; x < input.width; ++x) {
      for (let y = 1; y < input.height; ++y) {
        if (input.at(x, y) === ".") {
          columns.push(y - 1);
          break;
        }
      }
    }
    return { type: "lock", columns };
  } else {
    let columns = [];
    for (let x = 0; x < input.width; ++x) {
      for (let y = 1; y < input.height; ++y) {
        if (input.at(x, input.height - 1 - y) === ".") {
          columns.push(y - 1);
          break;
        }
      }
    }
    return { type: "key", columns };
  }
}

function parse(input: string) {
  return input
    .split("\n\n")
    .map((i) => i.trim())
    .filter((i) => i.length)
    .map((i) => ContinousGrid.parseCharGrid(i))
    .map(parseItem);
}

function matches(lock: Item, key: Item) {
  return lock.columns.every((c, i) => key.columns[i] + c <= 5);
}

export function partOne(input: string) {
  const items = parse(input);
  const keys = items.filter((item) => item.type === "key");
  const locks = items.filter((item) => item.type === "lock");
  return locks
    .map((lock) => keys.filter((key) => matches(lock, key)).length)
    .reduce((a, b) => a + b, 0);
}

export function partTwo(input: string) {
  return 0;
}
