import assert from "node:assert";
import { Point } from "../../common/point";
import { lines } from "../../common/utils";

export interface RobotParams {
  position: Point;
  velocity: Point;
  width: number;
  height: number;
}

export class Robot {
  private _pos: Point;
  private _vel: Point;
  private _w: number;
  private _h: number;

  constructor(params: RobotParams) {
    this._pos = params.position;
    this._vel = params.velocity;
    this._w = params.width;
    this._h = params.height;
  }

  move(steps: number) {
    this._pos.x += this._vel.x * steps;
    this._pos.y += this._vel.y * steps;
    this._pos.x = ((this._pos.x % this._w) + this._w) % this._w;
    this._pos.y = ((this._pos.y % this._h) + this._h) % this._h;
  }

  get position() {
    return { ...this._pos };
  }
}

export function parse(input: string): Robot[] {
  const ls = lines(input);
  return ls.map((line) => {
    const match = line.match(/p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/);
    assert(match, "Robot line is malformed");
    const position: Point = { x: Number(match[1]), y: Number(match[2]) };
    const velocity: Point = { x: Number(match[3]), y: Number(match[4]) };
    return new Robot({ position, velocity, width: 101, height: 103 });
  });
}

export function partOne(input: string) {
  const robots = parse(input);
  for (const robot of robots) {
    robot.move(100);
  }
  const middleX = 50;
  const middleY = 51;
  let byQuadrant = [0, 0, 0, 0];
  for (const robot of robots) {
    const pos = robot.position;
    if (pos.x === middleX || pos.y === middleY) {
      continue;
    }
    const quadrant = (pos.x > middleX ? 1 : 0) + (pos.y > middleY ? 2 : 0);
    byQuadrant[quadrant]++;
  }
  return byQuadrant.reduce((a, b) => a * b, 1);
}

export function arePositionsUnique(robots: Robot[]) {
  let occupied = new Set<string>();
  for (const robot of robots) {
    const key = `${robot.position.x}:${robot.position.y}`;
    if (occupied.has(key)) {
      return false;
    }
    occupied.add(key);
  }
  return true;
}

export function partTwo(input: string) {
  const robots = parse(input);
  let secondsPassed = 0;
  while (true) {
    robots.forEach((robot) => robot.move(1));
    secondsPassed++;
    if (arePositionsUnique(robots)) {
      return secondsPassed;
    }
  }
}
