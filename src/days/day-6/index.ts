import { Worker } from "node:worker_threads";
import { Direction, difference } from "../../common/grid";
import { WorkerData, findOnGrid, isOnGrid, key, rotate } from "./common";
import { ContinousGrid } from "../../common/continous-grid";
import { Point } from "../../common/point";

function parsePointFromKey(key: string): Point {
  const [x, y] = key.split(":");
  const p = { x: Number(x), y: Number(y) };
  if (isNaN(p.x) || isNaN(p.y)) {
    throw new TypeError(`Invalid point key: ${key}`);
  }
  return p;
}

function collectPositions(grid: ContinousGrid<string>) {
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

export function partOne(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  const positions = collectPositions(grid);
  return positions.length;
}

const P2_WORKER_COUNT = 12;

export async function partTwo(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  const possiblePlacements = collectPositions(grid);

  const batches = Array(P2_WORKER_COUNT)
    .fill(0)
    .map(() => [] as Point[]);

  for (let i = 0; i < possiblePlacements.length; ++i) {
    const point = possiblePlacements[i];
    batches[i % P2_WORKER_COUNT].push(point);
  }

  const promises: Array<Promise<number>> = [];
  for (let i = 0; i < P2_WORKER_COUNT; ++i) {
    const promise = new Promise<number>((resolve) => {
      const workerData: WorkerData = {
        input,
        batch: batches[i],
      };
      const worker = new Worker(WORKERS.DAY6, {
        workerData,
        eval: true,
      });
      worker.on("message", (result: number) => resolve(result));
    });
    promises.push(promise);
  }

  const result = (await Promise.all(promises)).reduce((a, b) => a + b);

  return result;
}
