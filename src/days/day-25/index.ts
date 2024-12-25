import assert from "../../vendor/assert";
import { ContinousGrid } from "../../common/continous-grid";
import { IGrid } from "../../common/grid";

interface Item {
  type: "key" | "lock";
  columns: number[];
}

interface Keychain {
  byColumns: Array<Map<number, Set<Item>>>;
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

function createKeychain(items: Item[]) {
  const keychain: Keychain = {
    byColumns: Array(5)
      .fill(0)
      .map(() => new Map()),
  };
  for (const item of items) {
    if (item.type === "lock") {
      continue;
    }
    for (let i = 0; i < item.columns.length; ++i) {
      const height = item.columns[i];
      let columnBucket = keychain.byColumns[i];
      assert(columnBucket);
      for (let noOverlap = height; noOverlap <= 5; ++noOverlap) {
        let heightBucket = columnBucket.get(noOverlap);
        if (!heightBucket) {
          heightBucket = new Set();
          columnBucket.set(noOverlap, heightBucket);
        }
        heightBucket.add(item);
      }
    }
  }
  return keychain;
}

function countKeys(lock: Item, keychain: Keychain) {
  let candidates = [
    ...(keychain.byColumns[0].get(5 - lock.columns[0]) ?? new Set()),
  ];
  for (let i = 1; i < 5 && candidates.length > 0; ++i) {
    let filter = keychain.byColumns[i].get(5 - lock.columns[i]) ?? new Set();
    candidates = candidates.filter((c) => filter.has(c));
  }
  return candidates.length;
}

export function partOne(input: string) {
  const items = parse(input);
  const keychain = createKeychain(items);
  return items
    .filter((item) => item.type === "lock")
    .map((item) => countKeys(item, keychain))
    .reduce((a, b) => a + b, 0);
}

export function partTwo(input: string) {
  return 0;
}
