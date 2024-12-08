import { ContinousGrid } from "../../common/continous-grid";
import { Point } from "../../common/point";

function antiNodeKey(grid: ContinousGrid<any>, x: number, y: number) {
  return y * grid.width + x;
}

function createAntiNodeP1(a: Point, b: Point): Point {
  return { x: 2 * a.x - b.x, y: 2 * a.y - b.y };
}

function simplify(x: number, y: number): [number, number] {
  let div = 2;
  while (div <= Math.abs(x) && div <= Math.abs(y)) {
    if (x % div === 0 && y % div === 0) {
      x /= div;
      y /= div;
    } else {
      div++;
    }
  }
  return [x, y];
}

function* createAntiNodesP2(a: Point, b: Point, width: number, height: number) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  [dx, dy] = simplify(dx, dy);

  let current = { ...a };
  while (
    current.x < width &&
    current.y < height &&
    current.x >= 0 &&
    current.y >= 0
  ) {
    yield { ...current };
    current.x += dx;
    current.y += dy;
  }
  dx = -dx;
  dy = -dy;
  current = { ...a };
  while (
    current.x < width &&
    current.y < height &&
    current.x >= 0 &&
    current.y >= 0
  ) {
    yield { ...current };
    current.x += dx;
    current.y += dy;
  }
}

export function partOne(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  const frequencies = new Map<string, Array<Point>>();
  const antiNodes = new Set<number>();

  for (const { x, y, value } of grid) {
    if (value === ".") {
      continue;
    }
    let batch = frequencies.get(value);
    if (!batch) {
      batch = [];
      frequencies.set(value, batch);
    }
    batch.push({ x, y });
  }

  for (const [, batch] of frequencies) {
    for (let i = 0; i < batch.length; ++i) {
      for (let j = 0; j < batch.length; ++j) {
        if (j === i) {
          continue;
        }
        const antiNode = createAntiNodeP1(batch[i], batch[j]);
        if (
          antiNode.x < 0 ||
          antiNode.y < 0 ||
          antiNode.x >= grid.width ||
          antiNode.y >= grid.height
        ) {
          continue;
        }
        antiNodes.add(antiNodeKey(grid, antiNode.x, antiNode.y));
      }
    }
  }

  return antiNodes.size;
}

export function partTwo(input: string) {
  const grid = ContinousGrid.parseCharGrid(input);
  const frequencies = new Map<string, Array<Point>>();
  const antiNodes = new Set<number>();

  for (const { x, y, value } of grid) {
    if (value === ".") {
      continue;
    }
    let batch = frequencies.get(value);
    if (!batch) {
      batch = [];
      frequencies.set(value, batch);
    }
    batch.push({ x, y });
  }

  for (const [, batch] of frequencies) {
    for (let i = 0; i < batch.length; ++i) {
      for (let j = i + 1; j < batch.length; ++j) {
        for (const an of createAntiNodesP2(
          batch[i],
          batch[j],
          grid.width,
          grid.height,
        )) {
          antiNodes.add(antiNodeKey(grid, an.x, an.y));
        }
      }
    }
  }

  return antiNodes.size;
}
