import { Direction, Grid, difference } from "../../common/grid";

interface Point {
  x: number;
  y: number;
}

function findOnGrid(grid: Grid, symbol: string): Point | null {
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === symbol) {
        return { x, y };
      }
    }
  }

  return null;
}

function rotate(direction: Direction): Direction {
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

function isOnGrid(grid: Grid, point: Point): boolean {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x < grid.width &&
    point.y < grid.height
  );
}

function key(point: Point): string {
  return `${point.x}:${point.y}`;
}

function directionalKey(point: Point, direction: Direction): string {
  return `${point.x}:${point.y}:${direction}`;
}

function isInfiniteLoop(grid: Grid) {
  const visited = new Set<string>();
  let guard = findOnGrid(grid, "^");
  let currentDirection = Direction.N;

  if (!guard) {
    throw new Error("didn't find a guard");
  }

  while (isOnGrid(grid, guard)) {
    const dkey = directionalKey(guard, currentDirection);
    if (visited.has(dkey)) {
      return true;
    }
    visited.add(dkey);
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

function parsePointFromKey(key: string): Point {
  const [x, y] = key.split(":");
  const p = { x: Number(x), y: Number(y) };
  if (isNaN(p.x) || isNaN(p.y)) {
    throw new TypeError(`Invalid point key: ${key}`);
  }
  return p;
}

function collectPositions(grid: Grid) {
  const visited = new Set<string>();
  let guard = findOnGrid(grid, "^");
  let currentDirection = Direction.N;

  if (!guard) {
    throw new Error("didn't find a guard");
  }

  while (isOnGrid(grid, guard)) {
    visited.add(key(guard));
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

  return [...visited].map(parsePointFromKey);
}

function placeObstacle(grid: Grid, x: number, y: number) {
  const copy = grid.clone();
  copy.set(x, y, "#");
  return copy;
}

export function partOne(input: string) {
  const grid = new Grid(input);
  const positions = collectPositions(grid);
  return positions.length;
}

export function partTwo(input: string) {
  const grid = new Grid(input);
  let result = 0;
  const possiblePlacements = collectPositions(grid);

  for (const point of possiblePlacements) {
    if (grid.at(point.x, point.y) !== ".") {
      continue;
    }
    let newGrid = placeObstacle(grid, point.x, point.y);
    if (isInfiniteLoop(newGrid)) {
      result += 1;
    }
  }

  return result;
}
