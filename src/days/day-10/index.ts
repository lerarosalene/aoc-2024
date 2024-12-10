import { ContinousGrid } from "../../common/continous-grid";
import type { IGrid } from "../../common/grid";
import type { Point } from "../../common/point";

function key(p: Point) {
  return `${p.x}:${p.y}`;
}

function parseKey(key: string): Point {
  const [x, y] = key.split(":");
  return { x: Number(x), y: Number(y) };
}

function* neighbours(pt: Point): IterableIterator<Point> {
  const { x, y } = pt;
  yield { x, y: y - 1 };
  yield { x: x - 1, y };
  yield { x: x + 1, y };
  yield { x: x, y: y + 1 };
}

function expand(
  grid: IGrid<string>,
  points: Set<string>,
  targetHeight: number,
) {
  const result = new Set<string>();
  const currentPoints = [...points].map(parseKey);
  for (const pt of currentPoints) {
    for (const neighbour of neighbours(pt)) {
      if (grid.at(neighbour.x, neighbour.y) === String(targetHeight)) {
        result.add(key(neighbour));
      }
    }
  }
  return result;
}

export function getScoreP1(grid: IGrid<string>, trailhead: Point) {
  let points = new Set([trailhead].map(key));

  for (let i = 1; i <= 9; ++i) {
    points = expand(grid, points, i);
  }

  return points.size;
}

export function partOne(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  const trailheads: Point[] = [];
  for (const { x, y, value } of grid) {
    if (value === "0") {
      trailheads.push({ x, y });
    }
  }

  return trailheads.reduce((acc, value) => acc + getScoreP1(grid, value), 0);
}

export function partTwo(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  const sumGrid = new ContinousGrid<number>(
    grid.width,
    grid.height,
    Array(grid.width * grid.height).fill(0),
  );

  for (const { x, y, value } of grid) {
    if (value === "9") {
      sumGrid.set(x, y, 1);
    }
  }

  for (let i = 8; i >= 0; --i) {
    for (const { x, y, value } of grid) {
      if (value !== String(i + 1)) {
        continue;
      }
      for (const neighbour of neighbours({ x, y })) {
        if (grid.at(neighbour.x, neighbour.y) === String(i)) {
          const current = sumGrid.at(neighbour.x, neighbour.y);
          const adding = sumGrid.at(x, y);
          sumGrid.set(neighbour.x, neighbour.y, (current ?? 0) + (adding ?? 0));
        }
      }
    }
  }

  let result = 0;
  for (const { x, y, value } of grid) {
    if (value === "0") {
      result += sumGrid.at(x, y) ?? 0;
    }
  }
  return result;
}
