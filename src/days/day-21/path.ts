import assert from "../../vendor/assert";
import { Point } from "../../common/point";
import { getKeypad, KeypadType } from "./keypad";

interface SearchEntry {
  x: number;
  y: number;
  path: string;
}

export class KeypadPathFinder {
  private _cache = new Map<string, string[]>();

  public findPath(from: string, to: string, kp: KeypadType) {
    const key = KeypadPathFinder.pathKey(from, to, kp);
    const cached = this._cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    let start: Point | null = null;
    let end: Point | null = null;
    const grid = getKeypad(kp);
    for (let x = 0; x < grid.width; ++x) {
      for (let y = 0; y < grid.height; ++y) {
        if (grid.at(x, y) === from) {
          start = { x, y };
        }
        if (grid.at(x, y) === to) {
          end = { x, y };
        }
      }
    }

    if (from === to) {
      this._cache.set(key, [""]);
      return [""];
    }

    assert(start, "start button must exist on keypad");
    assert(end, "end button must exist on keypad");

    let queue: SearchEntry[] = [{ x: start.x, y: start.y, path: "" }];
    let visited = new Set<string>();
    let results: SearchEntry[] = [];

    while (queue.length) {
      let next: SearchEntry[] = [];
      for (let entry of queue) {
        let up = { x: entry.x, y: entry.y - 1, path: entry.path + "^" };
        let down = { x: entry.x, y: entry.y + 1, path: entry.path + "v" };
        let left = { x: entry.x - 1, y: entry.y, path: entry.path + "<" };
        let right = { x: entry.x + 1, y: entry.y, path: entry.path + ">" };

        let neighbours = [up, down, left, right];
        for (const neighbour of neighbours) {
          const { x, y } = neighbour;
          if (x < 0 || y < 0) {
            continue;
          }
          if (x >= grid.width || y >= grid.height) {
            continue;
          }
          if (grid.at(x, y) === ".") {
            continue;
          }
          if (visited.has(KeypadPathFinder.entryKey(neighbour))) {
            continue;
          }
          if (x === end.x && y === end.y) {
            results.push(neighbour);
          }
          next.push(neighbour);
        }
      }
      queue = next;
      for (const entry of next) {
        visited.add(KeypadPathFinder.entryKey(entry));
      }
      if (results.length) {
        let result = results.map((res) => res.path);
        let minWeight = KeypadPathFinder.weight(result[0]);
        for (let i = 1; i < result.length; ++i) {
          if (KeypadPathFinder.weight(result[i]) < minWeight) {
            minWeight = KeypadPathFinder.weight(result[i]);
          }
        }
        result = result.filter(
          (path) => KeypadPathFinder.weight(path) === minWeight,
        );
        this._cache.set(key, result);
        return result;
      }
    }

    this._cache.set(key, []);
    return [];
  }

  private static entryKey(entry: SearchEntry) {
    return `${entry.x}:${entry.y}`;
  }

  private static pathKey(from: string, to: string, kp: KeypadType) {
    return `${from}:${to}:${KeypadType[kp]}`;
  }

  private static weight(path: string) {
    let result = 0;
    for (let i = 1; i < path.length; ++i) {
      if (path[i - 1] !== path[i]) {
        result++;
      }
    }
    return result;
  }
}
