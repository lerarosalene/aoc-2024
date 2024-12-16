import assert from "node:assert";
import fs from "node:fs";
import p from "node:path";
import { gzip } from "node:zlib";
import arg from "arg";
import { ContinousGrid } from "../../common/continous-grid";
import { Point } from "../../common/point";
import { IGrid } from "../../common/grid";
import {
  costKey,
  forward,
  getOrDefault,
  isValidPosition,
  key,
  mergeAddSearchEntry,
  posKey,
  rotate,
  SearchEntry,
  State,
} from ".";

const TRAIL_COLOR = "lightgreen";
const FINAL_TRAIL_COLOR = "pink";
const WALL_COLOR = "white";
const HEAD_COLOR = "gold";
const BG_COLOR = "#333";
const TILE_WIDTH = 16;
const ENTITY_GAP = 2;

const fsp = fs.promises;

interface ProgressFrame {
  _type: "progress";
  grid: IGrid<string>;
  queue: SearchEntry[];
}

interface FinalFrame {
  _type: "final";
  grid: IGrid<string>;
  trail: Set<string>;
}

type Frame = ProgressFrame | FinalFrame;

function* frames(input: string): IterableIterator<Frame> {
  const grid = ContinousGrid.parseCharGrid(input);
  let state: State | null = null;
  let finish: Point | null = null;
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === "S") {
        state = { x, y, direction: "e" };
      }
      if (grid.at(x, y) === "E") {
        finish = { x, y };
      }
    }
  }
  assert(state, "start not found");
  assert(finish, "finish not found");

  let queue: SearchEntry[] = [
    { state, cost: 0, visited: new Set([posKey(state)]) },
  ];
  let visited = new Map<string, number>();
  let minResult = Infinity;
  let tilesByResultLength = new Map<number, Set<string>>();
  visited.set(key(state), 0);

  while (queue.length > 0) {
    yield { grid, queue, _type: "progress" };
    let next = new Map<string, SearchEntry>();
    for (const entry of queue) {
      if (entry.state.x === finish.x && entry.state.y === finish.y) {
        if (entry.cost <= minResult) {
          minResult = entry.cost;
          let currentResults = tilesByResultLength.get(entry.cost);
          if (!currentResults) {
            currentResults = new Set();
            tilesByResultLength.set(entry.cost, currentResults);
          }
          for (const tile of entry.visited) {
            currentResults.add(tile);
          }
        }
        continue;
      }
      const nextRight: SearchEntry = {
        state: rotate(entry.state, true),
        cost: entry.cost + 1000,
        visited: entry.visited,
      };
      const nextLeft: SearchEntry = {
        state: rotate(entry.state, false),
        cost: entry.cost + 1000,
        visited: entry.visited,
      };
      const nextForwardSate = forward(entry.state);
      const nextForward: SearchEntry = {
        state: nextForwardSate,
        cost: entry.cost + 1,
        visited: new Set([...entry.visited, posKey(nextForwardSate)]),
      };
      if (
        getOrDefault(visited, key(nextRight.state), Infinity) >= nextRight.cost
      ) {
        mergeAddSearchEntry(next, costKey(nextRight), nextRight);
        visited.set(key(nextRight.state), nextRight.cost);
      }
      if (
        getOrDefault(visited, key(nextLeft.state), Infinity) >= nextLeft.cost
      ) {
        mergeAddSearchEntry(next, costKey(nextLeft), nextLeft);
        visited.set(key(nextLeft.state), nextLeft.cost);
      }
      if (
        isValidPosition(grid, nextForward.state) &&
        getOrDefault(visited, key(nextForward.state), Infinity) >=
          nextForward.cost
      ) {
        mergeAddSearchEntry(next, costKey(nextForward), nextForward);
        visited.set(key(nextForward.state), nextForward.cost);
      }
    }
    queue = [...next.values()];
  }

  for (let i = 0; i < 120; ++i) {
    yield {
      _type: "final",
      grid,
      trail: tilesByResultLength.get(minResult) ?? new Set(),
    };
  }
}

function buildSvg(frame: Frame): string {
  let result: string[] = [];
  const { grid } = frame;

  const width = grid.width * TILE_WIDTH;
  const height = grid.height * TILE_WIDTH;

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

  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      if (grid.at(x, y) === "#") {
        const tx = x * TILE_WIDTH + ENTITY_GAP;
        const ty = y * TILE_WIDTH + ENTITY_GAP;
        const tw = TILE_WIDTH - 2 * ENTITY_GAP;
        const th = TILE_WIDTH - 2 * ENTITY_GAP;
        result.push(
          `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="${WALL_COLOR}" />`,
        );
      }
    }
  }

  if (frame._type === "progress") {
    const { queue } = frame;
    for (const trail of queue) {
      for (const pos of trail.visited) {
        const [xRaw, yRaw] = pos.split(":");
        const x = Number(xRaw);
        const y = Number(yRaw);
        const tx = x * TILE_WIDTH + ENTITY_GAP;
        const ty = y * TILE_WIDTH + ENTITY_GAP;
        const tw = TILE_WIDTH - 2 * ENTITY_GAP;
        const th = TILE_WIDTH - 2 * ENTITY_GAP;
        result.push(
          `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="${TRAIL_COLOR}" />`,
        );
      }

      const tx = trail.state.x * TILE_WIDTH + ENTITY_GAP;
      const ty = trail.state.y * TILE_WIDTH + ENTITY_GAP;
      const tw = TILE_WIDTH - 2 * ENTITY_GAP;
      const th = TILE_WIDTH - 2 * ENTITY_GAP;
      result.push(
        `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="${HEAD_COLOR}" />`,
      );
    }
  } else if (frame._type === "final") {
    const { trail } = frame;
    for (const tile of trail) {
      const [xRaw, yRaw] = tile.split(":");
      const x = Number(xRaw);
      const y = Number(yRaw);

      const tx = x * TILE_WIDTH + ENTITY_GAP;
      const ty = y * TILE_WIDTH + ENTITY_GAP;
      const tw = TILE_WIDTH - 2 * ENTITY_GAP;
      const th = TILE_WIDTH - 2 * ENTITY_GAP;
      result.push(
        `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="${FINAL_TRAIL_COLOR}" />`,
      );
    }
  }

  result.push("</svg>");
  return result.join("\n");
}

async function main() {
  const args = arg({
    "--input": String,
    "--output": String,
    "-i": "--input",
    "-o": "--output",
  });

  const input = args["--input"];
  const output = args["--output"];

  assert(input, "input is provided (--input/-i)");
  assert(output, "output directory is provided (--output/-o)");

  const inputContents = await fsp.readFile(input, "utf-8");

  await fsp.mkdir(output, { recursive: true });
  const ioPromises: Array<Promise<any>> = [];
  let frameCounter = 0;
  for (const frame of frames(inputContents)) {
    let capturedCounter = frameCounter;
    const svg = buildSvg(frame);
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
