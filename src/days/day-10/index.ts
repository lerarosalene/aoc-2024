import { ContinousGrid } from "../../common/continous-grid";
import type { Point } from "../../common/point";

function key(p: Point) {
  return `${p.x}:${p.y}`;
}

function* neighbours(pt: Point): IterableIterator<Point> {
  const { x, y } = pt;
  yield { x, y: y - 1 };
  yield { x: x - 1, y };
  yield { x: x + 1, y };
  yield { x: x, y: y + 1 };
}

export function partOne(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  const sumGrid = new ContinousGrid(
    grid.width,
    grid.height,
    Array(grid.width * grid.height)
      .fill(0)
      .map(() => new Set<string>()),
  );

  for (const { x, y, value } of grid) {
    if (value === "9") {
      sumGrid.at(x, y)?.add(key({ x, y }));
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
          const adding = sumGrid.at(x, y) ?? new Set();
          for (let key of adding) {
            current?.add(key);
          }
        }
      }
    }
  }

  let result = 0;
  for (const { x, y, value } of grid) {
    if (value === "0") {
      result += sumGrid.at(x, y)?.size ?? 0;
    }
  }
  return result;
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
