import fs from "node:fs";
import assert from "node:assert";
import arg from "arg";
import { arePositionsUnique, parse, Robot } from ".";
import { Point } from "../../common/point";

const fsp = fs.promises;

function key(point: Point): string {
  return `${point.x}:${point.y}`;
}

function* neighbours(point: Point): IterableIterator<Point> {
  for (let dx = -1; dx < 2; ++dx) {
    for (let dy = -1; dy < 2; ++dy) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      yield { x: point.x + dx, y: point.y + dy };
    }
  }
}

function buildSvg(robots: Robot[]) {
  const result: string[] = [];
  result.push(`<?xml version="1.0" standalone="no"?>\n`);
  result.push(
    `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">`,
  );
  result.push(
    `<svg width="808" height="824" viewBox="0 0 808 824" xmlns="http://www.w3.org/2000/svg">`,
  );

  result.push(`<rect x="0" y="0" width="808" height="824" fill="#333" />`);

  const robotMap = new Map<string, Robot>();
  const robotColors = new Map<Robot, string>();

  for (const robot of robots) {
    robotMap.set(key(robot.position), robot);
  }

  for (const robot of robots) {
    let count = 0;
    for (const neighbour of neighbours(robot.position)) {
      if (robotMap.has(key(neighbour))) {
        count++;
      }
    }
    if (count >= 4) {
      robotColors.set(robot, "lightgreen");
      for (const pos of neighbours(robot.position)) {
        const neighbour = robotMap.get(key(pos));
        if (!neighbour) {
          continue;
        }
        robotColors.set(neighbour, "lightgreen");
      }
      continue;
    }
    if ((count === 2 || count === 3) && !robotColors.has(robot)) {
      robotColors.set(robot, "red");
    }
  }

  for (const robot of robots) {
    const { x, y } = robot.position;
    result.push(
      `<rect x="${x * 8}" y="${y * 8}" width="8" height="8" fill="${robotColors.get(robot) ?? "yellow"}" />`,
    );
  }

  result.push("</svg>");
  return result.join("\n");
}

export async function main() {
  const args = arg({
    "--input": String,
    "--output": String,
    "-i": "--input",
    "-o": "--output",
  });

  const input = args["--input"];
  const output = args["--output"];
  assert(input, "input should be specified");
  assert(output, "output should be specified");

  const inputContents = await fsp.readFile(input, "utf-8");
  const robots = parse(inputContents);

  while (true) {
    robots.forEach((robot) => robot.move(1));
    if (arePositionsUnique(robots)) {
      break;
    }
  }

  const svg = buildSvg(robots);
  await fsp.writeFile(output, svg);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
