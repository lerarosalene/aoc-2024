import assert from "node:assert";
import { ContinousGrid } from "../../common/continous-grid";
import { Point } from "../../common/point";
import { IGrid } from "../../common/grid";

function parse(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  let start: Point | null = null;
  let end: Point | null = null;
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === "S") {
        start = { x, y };
      } else if (grid.at(x, y) === "E") {
        end = { x, y };
      }
    }
  }

  assert(start, "there is start");
  assert(end, "there is finish");

  return { grid, start, end };
}

function posKey(position: Point) {
  return `${position.x}:${position.y}`;
}

interface DistanceFillEntry {
  x: number;
  y: number;
  current: number;
}

function fillDistances(grid: IGrid<string>, from: Point) {
  const distanceGrid = new ContinousGrid<number>(
    grid.width,
    grid.height,
    Array(grid.width * grid.height).fill(Infinity),
  );
  distanceGrid.set(from.x, from.y, 0);
  let queue: DistanceFillEntry[] = [{ x: from.x, y: from.y, current: 0 }];
  while (queue.length) {
    let next = new Map<string, DistanceFillEntry>();
    for (const entry of queue) {
      let up = {
        x: entry.x,
        y: entry.y - 1,
        current: entry.current + 1,
      };
      let down = {
        x: entry.x,
        y: entry.y + 1,
        current: entry.current + 1,
      };
      let left = {
        x: entry.x - 1,
        y: entry.y,
        current: entry.current + 1,
      };
      let right = {
        x: entry.x + 1,
        y: entry.y,
        current: entry.current + 1,
      };

      for (let neighbour of [up, down, left, right]) {
        if (
          neighbour.x < 0 ||
          neighbour.y < 0 ||
          neighbour.x >= grid.width ||
          neighbour.y >= grid.height
        ) {
          continue;
        }
        if (grid.at(neighbour.x, neighbour.y) === "#") {
          continue;
        }
        const currentDistance =
          distanceGrid.at(neighbour.x, neighbour.y) ?? Infinity;
        if (neighbour.current >= currentDistance) {
          continue;
        }
        distanceGrid.set(neighbour.x, neighbour.y, neighbour.current);
        next.set(posKey(neighbour), neighbour);
      }
    }
    queue = [...next.values()];
  }

  return distanceGrid;
}

function calculateCheat(
  path: [Point, Point],
  startDistances: IGrid<number>,
  endDistances: IGrid<number>,
) {
  const startDistance = startDistances.at(path[0].x, path[0].y);
  const endDistance = endDistances.at(path[1].x, path[1].y);
  if (
    startDistance === null ||
    startDistance === Infinity ||
    endDistance === null ||
    endDistance === Infinity
  ) {
    return null;
  }
  return (
    startDistance +
    endDistance +
    Math.abs(path[0].x - path[1].x) +
    Math.abs(path[1].y - path[0].y)
  );
}

function solve(grid: IGrid<string>, start: Point, end: Point, max: number) {
  const startDistances = fillDistances(grid, start);
  const endDistances = fillDistances(grid, end);
  const uncheatedLength = startDistances.at(end.x, end.y);
  assert(uncheatedLength, "there is direct path");

  const cheats = new Map<string, number>();
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (
        startDistances.at(x, y) === null ||
        startDistances.at(x, y) === Infinity
      ) {
        continue;
      }
      for (let ex = x - max; ex < x + max + 1; ++ex) {
        for (let ey = y - max; ey < y + max + 1; ++ey) {
          if (
            endDistances.at(ex, ey) === null ||
            endDistances.at(ex, ey) === Infinity
          ) {
            continue;
          }
          const totalDistance = Math.abs(x - ex) + Math.abs(y - ey);
          if (totalDistance > max) {
            continue;
          }
          const cheatedLength = calculateCheat(
            [
              { x, y },
              { x: ex, y: ey },
            ],
            startDistances,
            endDistances,
          );
          if (cheatedLength === null) {
            continue;
          }
          const saving = uncheatedLength - cheatedLength;
          const cheatKey = `${x}:${y}:${ex}:${ey}`;
          cheats.set(
            cheatKey,
            Math.max(cheats.get(cheatKey) ?? -Infinity, saving),
          );
        }
      }
    }
  }

  return [...cheats].filter(([, saving]) => saving >= 100).length;
}

export function partOne(input: string) {
  const { grid, start, end } = parse(input);
  return solve(grid, start, end, 2);
}

export function partTwo(input: string) {
  const { grid, start, end } = parse(input);
  return solve(grid, start, end, 20);
}
