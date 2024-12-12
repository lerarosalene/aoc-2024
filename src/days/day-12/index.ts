import { ContinousGrid } from "../../common/continous-grid";
import type { IGrid } from "../../common/grid";
import { Point } from "../../common/point";

function* neighbours(pt: Point): IterableIterator<Point> {
  const { x, y } = pt;
  yield { x, y: y - 1 };
  yield { x: x - 1, y };
  yield { x: x + 1, y };
  yield { x: x, y: y + 1 };
}

export function key(point: Point) {
  return `${point.x}:${point.y}`;
}

export function parseKey(key: string): Point {
  const [x, y] = key.split(":").map((p) => Number(p));
  return { x, y };
}

function buildRegion(grid: IGrid<string>, point: Point) {
  let result = new Set<string>();
  let queue = [point];

  while (queue.length) {
    let next: Point[] = [];
    for (let point of queue) {
      result.add(key(point));
      for (let neighbour of neighbours(point)) {
        if (grid.at(neighbour.x, neighbour.y) !== grid.at(point.x, point.y)) {
          continue;
        }
        if (result.has(key(neighbour))) {
          continue;
        }
        result.add(key(neighbour));
        next.push(neighbour);
      }
    }
    queue = next;
  }
  return result;
}

function findNext(grid: IGrid<any>, totalVisited: Set<string>): Point | null {
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (!totalVisited.has(key({ x, y }))) {
        return { x, y };
      }
    }
  }
  return null;
}

function perimeter(region: Set<string>) {
  let result = 0;
  for (let k of region) {
    const pt = parseKey(k);
    for (let neighbour of neighbours(pt)) {
      if (!region.has(key(neighbour))) {
        result += 1;
      }
    }
  }

  return result;
}

function addSegment(
  segments: Map<number, number[]>,
  bucketID: number,
  coordinate: number,
) {
  let bucket = segments.get(bucketID);
  if (!bucket) {
    bucket = [];
    segments.set(bucketID, bucket);
  }
  bucket.push(coordinate);
}

export type SegmentGroup = Map<number, number[]>;

function countSides(segments: SegmentGroup) {
  let total = 0;
  for (const arr of segments.values()) {
    if (!arr.length) {
      continue;
    }
    total += 1;
    let sorted = [...arr].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; ++i) {
      if (sorted[i - 1] !== sorted[i] - 1) {
        total += 1;
      }
    }
  }
  return total;
}

function getSegments(region: Set<string>): SegmentGroup[] {
  let hLSegments = new Map<number, number[]>(); // y -> [x]
  let hRSegments = new Map<number, number[]>(); // y -> [x]
  let vUSegments = new Map<number, number[]>(); // x -> [y]
  let vDSegments = new Map<number, number[]>(); // x -> [y]
  for (let k of region) {
    const pt = parseKey(k);
    const top: Point = { x: pt.x, y: pt.y - 1 };
    const bottom: Point = { x: pt.x, y: pt.y + 1 };
    const right: Point = { x: pt.x + 1, y: pt.y };
    const left: Point = { x: pt.x - 1, y: pt.y };
    if (!region.has(key(top))) {
      addSegment(hLSegments, pt.y - 1, pt.x);
    }
    if (!region.has(key(bottom))) {
      addSegment(hRSegments, pt.y, pt.x);
    }
    if (!region.has(key(left))) {
      addSegment(vUSegments, pt.x - 1, pt.y);
    }
    if (!region.has(key(right))) {
      addSegment(vDSegments, pt.x, pt.y);
    }
  }

  return [hLSegments, hRSegments, vUSegments, vDSegments];
}

export function sides(region: Set<string>) {
  return getSegments(region)
    .map((group) => countSides(group))
    .reduce((a, b) => a + b);
}

export function getRegions(grid: IGrid<string>) {
  const regions: Array<Set<string>> = [];
  const totalVisited = new Set<string>();
  let start: Point | null = { x: 0, y: 0 };

  do {
    const next = buildRegion(grid, start);
    regions.push(next);
    next.forEach((k) => totalVisited.add(k));
    start = findNext(grid, totalVisited);
  } while (start);

  return regions;
}

export function partOne(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  const regions = getRegions(grid);

  return regions.map((r) => perimeter(r) * r.size).reduce((a, b) => a + b);
}

export function partTwo(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  const regions = getRegions(grid);

  return regions.map((r) => sides(r) * r.size).reduce((a, b) => a + b);
}
