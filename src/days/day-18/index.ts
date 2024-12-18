import { Point } from "../../common/point";
import { lines } from "../../common/utils";

function parse(input: string) {
  return lines(input).map((line): Point => {
    const [xRaw, yRaw] = line.split(",");
    return { x: Number(xRaw), y: Number(yRaw) };
  });
}

function key(pt: Point) {
  return `${pt.x}:${pt.y}`;
}

export interface SearchEntry {
  pt: Point;
  cost: number;
}

function getOrDefault<K, V>(map: Map<K, V>, key: K, def: V): V {
  return map.get(key) ?? def;
}

const P1_COUNT = 1024;
const GRID_SIZE = 70;

export function findPath(obstacles: Point[], length: number) {
  let obstacleSet = new Set<string>();
  for (let i = 0; i < length; ++i) {
    obstacleSet.add(key(obstacles[i]));
  }

  let queue: SearchEntry[] = [{ pt: { x: 0, y: 0 }, cost: 0 }];
  let visited = new Map<string, number>();
  let minResult = Infinity;
  visited.set(key(queue[0].pt), 0);

  while (queue.length > 0) {
    let next: SearchEntry[] = [];
    for (const entry of queue) {
      const candidates = [
        { x: entry.pt.x + 1, y: entry.pt.y },
        { x: entry.pt.x - 1, y: entry.pt.y },
        { x: entry.pt.x, y: entry.pt.y + 1 },
        { x: entry.pt.x, y: entry.pt.y - 1 },
      ];

      for (const pt of candidates) {
        if (pt.x < 0 || pt.x > GRID_SIZE) {
          continue;
        }
        if (pt.y < 0 || pt.y > GRID_SIZE) {
          continue;
        }
        if (obstacleSet.has(key(pt))) {
          continue;
        }
        const currentCost = getOrDefault(visited, key(pt), Infinity);
        const nextCost = entry.cost + 1;
        if (nextCost >= currentCost) {
          continue;
        }
        next.push({ pt, cost: nextCost });
        visited.set(key(pt), nextCost);
        if (pt.x === GRID_SIZE && pt.y === GRID_SIZE) {
          if (entry.cost <= minResult) {
            minResult = entry.cost;
          }
          continue;
        }
      }
    }
    queue = next;
  }

  if (minResult !== Infinity) {
    return minResult + 1;
  } else {
    return -1;
  }
}

export function partOne(input: string) {
  const obstacles = parse(input);
  return findPath(obstacles, P1_COUNT);
}

export function partTwo(input: string) {
  const obstacles = parse(input);
  let latestPossible = 0;
  let firstImpossible = obstacles.length;

  while (firstImpossible - latestPossible > 1) {
    let middle = Math.trunc((firstImpossible + latestPossible) / 2);
    const isPossible = findPath(obstacles, middle) > -1;
    if (isPossible) {
      latestPossible = middle;
    } else {
      firstImpossible = middle;
    }
  }

  const bummer = obstacles[firstImpossible - 1];
  return `${bummer.x},${bummer.y}`;
}
