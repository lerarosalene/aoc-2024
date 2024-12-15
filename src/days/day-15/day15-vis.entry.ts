import fs from "node:fs";
import p from "node:path";
import assert from "node:assert";
import { gzip } from "node:zlib";
import arg from "arg";
import { ContinousGrid } from "../../common/continous-grid";
import { IGrid } from "../../common/grid";
import { Point } from "../../common/point";
import { attemptMoveP2, key, parse } from ".";

const fsp = fs.promises;

const ROBOT_COLOR = "lightgreen";
const WALL_COLOR = "white";
const BOX_COLOR = "gold";
const BG_COLOR = "#333";
const TILE_WIDTH = 16;
const ENTITY_GAP = 2;

interface State {
  wideGrid: IGrid<string>;
  robot: Point;
  boxes: Point[];
}

function* states(input: string) {
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
  yield { wideGrid, robot, boxes };
  for (const symbol of instructions.trim()) {
    attemptMoveP2(wideGrid, robot, boxMap, symbol);
    yield { wideGrid, robot, boxes };
  }
}

function buildSvg(state: State) {
  let result: string[] = [];
  const { wideGrid, robot, boxes } = state;

  const width = wideGrid.width * TILE_WIDTH;
  const height = wideGrid.height * TILE_WIDTH;

  result.push(`<?xml version="1.0" standalone="no"?>`);
  result.push(
    `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">`,
  );
  result.push(
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`,
  );
  result.push(
    `<rect x="0" y="0" width="${width}" height="${height}" fill="${BG_COLOR}" />`,
  );

  for (let x = 0; x < wideGrid.width; ++x) {
    for (let y = 0; y < wideGrid.height; ++y) {
      if (wideGrid.at(x, y) === "#") {
        result.push(
          `<rect x="${x * TILE_WIDTH + ENTITY_GAP}" y="${y * TILE_WIDTH + ENTITY_GAP}" width="${TILE_WIDTH - 2 * ENTITY_GAP}" height="${TILE_WIDTH - 2 * ENTITY_GAP}" fill="${WALL_COLOR}" />`,
        );
      }
    }
  }

  const robotTileX = robot.x * TILE_WIDTH + ENTITY_GAP;
  const robotTileY = robot.y * TILE_WIDTH + ENTITY_GAP;
  const robotTileSize = TILE_WIDTH - 2 * ENTITY_GAP;

  result.push(
    `<rect x="${robotTileX}" y="${robotTileY}" width="${robotTileSize}" height="${robotTileSize}" fill="${ROBOT_COLOR}" />`,
  );

  for (const box of boxes) {
    const boxTileX = box.x * TILE_WIDTH + ENTITY_GAP;
    const boxTileY = box.y * TILE_WIDTH + ENTITY_GAP;
    const boxTileWidth = (TILE_WIDTH - ENTITY_GAP) * 2;
    const boxTileHeight = TILE_WIDTH - ENTITY_GAP * 2;
    result.push(
      `<rect x="${boxTileX}" y="${boxTileY}" width="${boxTileWidth}" height="${boxTileHeight}" fill="${BOX_COLOR}" />`,
    );
  }

  result.push("</svg>");
  return result.join("\n");
}

async function main() {
  const args = arg({
    "--input": String,
    "--output": String,
    "--limit": Number,
    "-i": "--input",
    "-o": "--output",
    "-l": "--limit",
  });

  const input = args["--input"];
  const output = args["--output"];
  const frameLimit = args["--limit"];

  assert(input, "input is provided (--input/-i)");
  assert(output, "output directory is provided (--output/-o)");

  const inputContents = await fsp.readFile(input, "utf-8");

  await fsp.mkdir(output, { recursive: true });
  const ioPromises: Array<Promise<any>> = [];
  let frameCounter = 0;
  for (const state of states(inputContents)) {
    let capturedCounter = frameCounter;
    const svg = buildSvg(state);
    ioPromises.push(
      new Promise<void>((resolve, reject) => {
        gzip(svg, (error, result) => {
          if (error) {
            return void reject(error);
          }
          const path = p.join(
            output,
            `${String(capturedCounter).padStart(5, "0")}.svgz`,
          );
          fs.writeFile(path, result, (error) => {
            if (error) {
              return void reject(error);
            }
            resolve();
          });
        });
      }),
    );
    frameCounter++;
    if (frameLimit !== undefined && frameCounter > frameLimit) {
      break;
    }
    console.log(frameCounter);
    if (frameCounter % 100 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  await Promise.all(ioPromises);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
