import assert from "node:assert";
import { ContinousGrid } from "../../common/continous-grid";
import type { Point } from "../../common/point";
import type { IGrid } from "../../common/grid";

export function parse(input: string) {
  const [map, instructions] = input.split("\n\n");
  const grid = ContinousGrid.parseCharGrid(map);
  let robot: Point | null = null;
  let boxes: Point[] = [];
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === "@") {
        assert(robot === null, "there can only be one robot");
        robot = { x, y };
        continue;
      }
      if (grid.at(x, y) === "O") {
        boxes.push({ x, y });
      }
    }
  }
  assert(robot, "there must be a robot");
  return {
    grid,
    robot,
    boxes,
    instructions: instructions.split("\n").join("").trim(),
  };
}

function direction(input: string): Point {
  switch (input) {
    case "^":
      return { x: 0, y: -1 };
    case "<":
      return { x: -1, y: 0 };
    case ">":
      return { x: 1, y: 0 };
    case "v":
      return { x: 0, y: 1 };
    default:
      throw new Error("unknown direction");
  }
}

export function key(point: Point) {
  return `${point.x}:${point.y}`;
}

function attemptMoveP1(
  grid: IGrid<string>,
  robot: Point,
  boxMap: Map<string, Point>,
  instruction: string,
) {
  let movedBoxes = new Set<Point>();
  const dir = direction(instruction);
  let nextRobot: Point = { x: robot.x + dir.x, y: robot.y + dir.y };
  let collision = { ...nextRobot };
  let movedBox: Point | undefined = undefined;
  while ((movedBox = boxMap.get(key(collision)))) {
    movedBoxes.add(movedBox);
    collision.x += dir.x;
    collision.y += dir.y;
  }
  if (grid.at(nextRobot.x, nextRobot.y) === "#") {
    return;
  }
  for (const movedBox of movedBoxes) {
    if (grid.at(movedBox.x + dir.x, movedBox.y + dir.y) === "#") {
      return;
    }
  }

  robot.x += dir.x;
  robot.y += dir.y;

  for (const box of movedBoxes) {
    if (boxMap.get(key(box)) === box) {
      boxMap.delete(key(box));
    }
    box.x += dir.x;
    box.y += dir.y;
    boxMap.set(key(box), box);
  }
}

function exists<T>(item: T | null | undefined): item is T {
  return item !== null && item !== undefined;
}

function getCollidedBoxes(
  boxMap: Map<string, Point>,
  collisions: Point[],
): Point[] | null {
  const collided = collisions.map((pt) => boxMap.get(key(pt))).filter(exists);
  return collided.length > 0 ? collided : null;
}

export function attemptMoveP2(
  grid: IGrid<string>,
  robot: Point,
  boxMap: Map<string, Point>,
  instruction: string,
) {
  let movedBoxes = new Set<Point>();
  const dir = direction(instruction);
  let nextRobot: Point = { x: robot.x + dir.x, y: robot.y + dir.y };
  let collisions: Point[] = [{ ...nextRobot }];
  let collidedBoxes: Point[] | null = null;
  const visitedCollisons = new Set<string>();
  while ((collidedBoxes = getCollidedBoxes(boxMap, collisions))) {
    collisions.forEach((pt) => visitedCollisons.add(key(pt)));
    collidedBoxes.forEach((box) => movedBoxes.add(box));
    let nextCollisions: Point[] = [];
    collidedBoxes.forEach((box) => {
      nextCollisions.push({ x: box.x + dir.x, y: box.y + dir.y });
      nextCollisions.push({ x: box.x + dir.x + 1, y: box.y + dir.y });
    });
    collisions = nextCollisions.filter((pt) => !visitedCollisons.has(key(pt)));
  }

  if (grid.at(nextRobot.x, nextRobot.y) === "#") {
    return;
  }
  for (const movedBox of movedBoxes) {
    if (grid.at(movedBox.x + dir.x, movedBox.y + dir.y) === "#") {
      return;
    }
    if (grid.at(movedBox.x + dir.x + 1, movedBox.y + dir.y) === "#") {
      return;
    }
  }

  robot.x += dir.x;
  robot.y += dir.y;

  for (const box of movedBoxes.values()) {
    if (boxMap.get(key(box)) === box) {
      boxMap.delete(key(box));
    }
    if (boxMap.get(key({ x: box.x + 1, y: box.y })) === box) {
      boxMap.delete(key({ x: box.x + 1, y: box.y }));
    }
    box.x += dir.x;
    box.y += dir.y;
    boxMap.set(key(box), box);
    boxMap.set(key({ x: box.x + 1, y: box.y }), box);
  }
}

export function stateToStringP1(
  grid: IGrid<string>,
  robot: Point,
  boxes: Point[],
) {
  const printGrid = new ContinousGrid<string>(
    grid.width,
    grid.height,
    Array(grid.width * grid.height).fill("."),
  );
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === "#") {
        printGrid.set(x, y, "#");
      }
    }
  }
  printGrid.set(robot.x, robot.y, "@");
  for (const box of boxes) {
    printGrid.set(box.x, box.y, "O");
  }
  return printGrid.toString();
}

export function stateToStringP2(
  grid: IGrid<string>,
  robot: Point,
  boxes: Point[],
) {
  const printGrid = new ContinousGrid<string>(
    grid.width,
    grid.height,
    Array(grid.width * grid.height).fill("."),
  );
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === "#") {
        printGrid.set(x, y, "#");
      }
    }
  }
  printGrid.set(robot.x, robot.y, "@");
  for (const box of boxes) {
    printGrid.set(box.x, box.y, "[");
    printGrid.set(box.x + 1, box.y, "]");
  }
  return printGrid.toString();
}

export function partOne(input: string) {
  let { grid, robot, boxes, instructions } = parse(input);
  let boxMap = new Map<string, Point>();
  for (const box of boxes) {
    boxMap.set(key(box), box);
  }
  for (const symbol of instructions.trim()) {
    attemptMoveP1(grid, robot, boxMap, symbol);
  }
  return boxes.map((box) => box.y * 100 + box.x).reduce((a, b) => a + b, 0);
}

export function partTwo(input: string) {
  let { grid, robot, boxes, instructions } = parse(input);
  const wideGrid = new ContinousGrid<string>(
    grid.width * 2,
    grid.height,
    Array(grid.width * grid.height * 2).fill("."),
  );
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.width; ++y) {
      if (grid.at(x, y) === "#") {
        wideGrid.set(x * 2, y, "#");
        wideGrid.set(x * 2 + 1, y, "#");
      }
    }
  }
  robot.x *= 2;
  for (const box of boxes) {
    box.x *= 2;
  }
  let boxMap = new Map<string, Point>();
  for (const box of boxes) {
    boxMap.set(key(box), box);
    boxMap.set(key({ x: box.x + 1, y: box.y }), box);
  }
  for (const symbol of instructions.trim()) {
    attemptMoveP2(wideGrid, robot, boxMap, symbol);
  }
  return boxes.map((box) => box.y * 100 + box.x).reduce((a, b) => a + b, 0);
}
