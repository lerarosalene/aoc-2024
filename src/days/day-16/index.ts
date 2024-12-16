import assert from "node:assert";
import { ContinousGrid } from "../../common/continous-grid";
import type { Point } from "../../common/point";
import { IGrid } from "../../common/grid";

export interface State {
  x: number;
  y: number;
  direction: "n" | "w" | "e" | "s";
}

export interface SearchEntry {
  state: State;
  cost: number;
  visited: Set<string>;
}

export function key(state: State) {
  return `${state.x}:${state.y}:${state.direction}`;
}

export function costKey(entry: SearchEntry) {
  return `${key(entry.state)}:${entry.cost}`;
}

export function posKey(state: State) {
  return `${state.x}:${state.y}`;
}

function rotateDirection(
  direction: "n" | "w" | "e" | "s",
  clockwise: boolean,
): "n" | "w" | "e" | "s" {
  if (clockwise) {
    switch (direction) {
      case "n":
        return "e";
      case "e":
        return "s";
      case "s":
        return "w";
      case "w":
        return "n";
      default:
        throw new Error(`unknown direction ${direction}`);
    }
  } else {
    switch (direction) {
      case "n":
        return "w";
      case "e":
        return "n";
      case "s":
        return "e";
      case "w":
        return "s";
      default:
        throw new Error(`unknown direction ${direction}`);
    }
  }
}

export function rotate(state: State, clockwise: boolean): State {
  const { x, y, direction } = state;
  return { x, y, direction: rotateDirection(direction, clockwise) };
}

export function forward(state: State): State {
  const { x, y, direction } = state;
  switch (direction) {
    case "n":
      return { x, y: y - 1, direction };
    case "e":
      return { x: x + 1, y, direction };
    case "w":
      return { x: x - 1, y, direction };
    case "s":
      return { x, y: y + 1, direction };
    default:
      throw new Error("unknown direction");
  }
}

export function isValidPosition(grid: IGrid<string>, position: Point) {
  const inBoundsX = position.x >= 0 && position.x < grid.width;
  const inBoundsY = position.y >= 0 && position.y < grid.height;
  const notAWall = grid.at(position.x, position.y) !== "#";
  return inBoundsX && inBoundsY && notAWall;
}

export function getOrDefault<K, V>(map: Map<K, V>, key: K, def: V): V {
  return map.get(key) ?? def;
}

export function partOne(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  let state: State | null = null;
  let finish: Point | null = null;
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === "S") {
        state = { x, y, direction: "e" };
      }
      if (grid.at(x, y) === "E") {
        finish = { x, y };
      }
    }
  }
  assert(state, "start not found");
  assert(finish, "finish not found");

  let queue: SearchEntry[] = [
    { state, cost: 0, visited: new Set([posKey(state)]) },
  ];
  let visited = new Map<string, number>();
  let minResult = Infinity;
  visited.set(key(state), 0);

  while (queue.length > 0) {
    let next: SearchEntry[] = [];
    for (const entry of queue) {
      if (entry.state.x === finish.x && entry.state.y === finish.y) {
        if (entry.cost <= minResult) {
          minResult = entry.cost;
        }
        continue;
      }
      const nextRight: SearchEntry = {
        state: rotate(entry.state, true),
        cost: entry.cost + 1000,
        visited: entry.visited,
      };
      const nextLeft: SearchEntry = {
        state: rotate(entry.state, false),
        cost: entry.cost + 1000,
        visited: entry.visited,
      };
      const nextForwardSate = forward(entry.state);
      const nextForward: SearchEntry = {
        state: nextForwardSate,
        cost: entry.cost + 1,
        visited: new Set([...entry.visited, posKey(nextForwardSate)]),
      };
      if (
        getOrDefault(visited, key(nextRight.state), Infinity) > nextRight.cost
      ) {
        next.push(nextRight);
        visited.set(key(nextRight.state), nextRight.cost);
      }
      if (
        getOrDefault(visited, key(nextLeft.state), Infinity) > nextLeft.cost
      ) {
        next.push(nextLeft);
        visited.set(key(nextLeft.state), nextLeft.cost);
      }
      if (
        isValidPosition(grid, nextForward.state) &&
        getOrDefault(visited, key(nextForward.state), Infinity) >
          nextForward.cost
      ) {
        next.push(nextForward);
        visited.set(key(nextForward.state), nextForward.cost);
      }
    }
    queue = next;
  }

  return minResult;
}

export function printTilesP2(grid: IGrid<string>, tiles: Set<string>) {
  const debugGrid = new ContinousGrid(
    grid.width,
    grid.height,
    Array(grid.width * grid.height).fill("."),
  );
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === "#") {
        debugGrid.set(x, y, "#");
      }
    }
  }
  for (let tile of tiles) {
    const [xRaw, yRaw] = tile.split(":");
    const x = Number(xRaw);
    const y = Number(yRaw);
    assert(!Number.isNaN(x), "correct x");
    assert(!Number.isNaN(y), "correct y");
    debugGrid.set(x, y, "O");
  }
  return debugGrid.toString();
}

export function mergeAddSearchEntry(
  next: Map<string, SearchEntry>,
  key: string,
  entry: SearchEntry,
) {
  const current = next.get(key);
  if (!current) {
    next.set(key, entry);
    return;
  }
  for (const tile of entry.visited) {
    current.visited.add(tile);
  }
}

export function partTwo(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  let state: State | null = null;
  let finish: Point | null = null;
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === "S") {
        state = { x, y, direction: "e" };
      }
      if (grid.at(x, y) === "E") {
        finish = { x, y };
      }
    }
  }
  assert(state, "start not found");
  assert(finish, "finish not found");

  let queue: SearchEntry[] = [
    { state, cost: 0, visited: new Set([posKey(state)]) },
  ];
  let visited = new Map<string, number>();
  let minResult = Infinity;
  let tilesByResultLength = new Map<number, Set<string>>();
  visited.set(key(state), 0);

  while (queue.length > 0) {
    let next = new Map<string, SearchEntry>();
    for (const entry of queue) {
      if (entry.state.x === finish.x && entry.state.y === finish.y) {
        if (entry.cost <= minResult) {
          minResult = entry.cost;
          let currentResults = tilesByResultLength.get(entry.cost);
          if (!currentResults) {
            currentResults = new Set();
            tilesByResultLength.set(entry.cost, currentResults);
          }
          for (const tile of entry.visited) {
            currentResults.add(tile);
          }
        }
        continue;
      }
      const nextRight: SearchEntry = {
        state: rotate(entry.state, true),
        cost: entry.cost + 1000,
        visited: entry.visited,
      };
      const nextLeft: SearchEntry = {
        state: rotate(entry.state, false),
        cost: entry.cost + 1000,
        visited: entry.visited,
      };
      const nextForwardSate = forward(entry.state);
      const nextForward: SearchEntry = {
        state: nextForwardSate,
        cost: entry.cost + 1,
        visited: new Set([...entry.visited, posKey(nextForwardSate)]),
      };
      if (
        getOrDefault(visited, key(nextRight.state), Infinity) >= nextRight.cost
      ) {
        mergeAddSearchEntry(next, costKey(nextRight), nextRight);
        visited.set(key(nextRight.state), nextRight.cost);
      }
      if (
        getOrDefault(visited, key(nextLeft.state), Infinity) >= nextLeft.cost
      ) {
        mergeAddSearchEntry(next, costKey(nextLeft), nextLeft);
        visited.set(key(nextLeft.state), nextLeft.cost);
      }
      if (
        isValidPosition(grid, nextForward.state) &&
        getOrDefault(visited, key(nextForward.state), Infinity) >=
          nextForward.cost
      ) {
        mergeAddSearchEntry(next, costKey(nextForward), nextForward);
        visited.set(key(nextForward.state), nextForward.cost);
      }
    }
    queue = [...next.values()];
  }

  return tilesByResultLength.get(minResult)?.size ?? -1;
}
