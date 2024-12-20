import { ContinousGrid } from "../../common/continous-grid";
import { Direction, difference } from "../../common/grid";
import { Point } from "../../common/point";

export interface WorkerData {
  input: string;
  batch: Point[];
}

export function key(point: Point): string {
  return `${point.x}:${point.y}`;
}

export function directionalKey(point: Point, direction: Direction): string {
  return `${point.x}:${point.y}:${direction}`;
}

export function placeObstacle(
  grid: ContinousGrid<string>,
  x: number,
  y: number,
) {
  const copy = grid.clone();
  copy.set(x, y, "#");
  return copy;
}

export function findOnGrid(
  grid: ContinousGrid<string>,
  symbol: string,
): Point | null {
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === symbol) {
        return { x, y };
      }
    }
  }

  return null;
}

export function isOnGrid(grid: ContinousGrid<string>, point: Point): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < grid.width &&
    point.y < grid.height
  );
}

export function rotate(direction: Direction): Direction {
  switch (direction) {
    case Direction.N:
      return Direction.E;
    case Direction.E:
      return Direction.S;
    case Direction.S:
      return Direction.W;
    case Direction.W:
      return Direction.N;
    default:
      throw new TypeError(
        `Unsupported direction: Direction.${Direction[direction]}`,
      );
  }
}

export function isInfiniteLoop(grid: ContinousGrid<string>) {
  const width = grid.width;
  const height = grid.height;
  const visited = new Uint8Array(width * height * 8);
  let guard = findOnGrid(grid, "^");
  let currentDirection = Direction.N;

  if (!guard) {
    throw new Error("didn't find a guard");
  }

  while (isOnGrid(grid, guard)) {
    const stateKey = (guard.y * width + guard.x) * 8 + currentDirection;
    if (visited[stateKey]) {
      return true;
    }
    visited[stateKey] = 1;
    let diff = difference(currentDirection);
    let next: Point = {
      x: guard.x + diff.x,
      y: guard.y + diff.y,
    };
    if (grid.at(next.x, next.y) === "#") {
      currentDirection = rotate(currentDirection);
    } else {
      guard = next;
    }
  }

  return false;
}
