import assert from "node:assert";
import fs from "node:fs";
import p from "node:path";
import { gzip } from "node:zlib";
import arg from "arg";
import { ContinousGrid } from "../../common/continous-grid";
import { getRegions, key, parseKey, sides } from ".";
import { Point } from "../../common/point";

const fsp = fs.promises;

const EXTERNAL_GAP = 4;
const FENCE_THICKNESS = 4;
const INTERNAL_GAP = 8;

const TOTAL_TILE_SIZE =
  EXTERNAL_GAP * 2 + FENCE_THICKNESS * 2 + INTERNAL_GAP * 2;

const TOTAL_ROW_HEIGHT = 200;

interface BorderTile {
  point: Point;
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

interface CornerTile {
  point: Point;
  topLeft: boolean;
  topRight: boolean;
  bottomLeft: boolean;
  bottomRight: boolean;
}

function getOrAddBoderTile(map: Map<string, BorderTile>, point: Point) {
  let tile = map.get(key(point));
  if (!tile) {
    tile = { point, top: false, right: false, bottom: false, left: false };
    map.set(key(point), tile);
  }
  return tile;
}

function getOrAddCornerTile(map: Map<string, CornerTile>, point: Point) {
  let tile = map.get(key(point));
  if (!tile) {
    tile = {
      point,
      topRight: false,
      bottomLeft: false,
      bottomRight: false,
      topLeft: false,
    };
    map.set(key(point), tile);
  }
  return tile;
}

export function getTiles(region: Set<string>): Omit<DataEntry, "region"> {
  const borderTiles = new Map<string, BorderTile>();
  const cornerTiles = new Map<string, CornerTile>();
  for (const k of region) {
    const pt = parseKey(k);
    const top: Point = { x: pt.x, y: pt.y - 1 };
    const bottom: Point = { x: pt.x, y: pt.y + 1 };
    const right: Point = { x: pt.x + 1, y: pt.y };
    const left: Point = { x: pt.x - 1, y: pt.y };
    if (!region.has(key(top))) {
      getOrAddBoderTile(borderTiles, pt).top = true;
    }
    if (!region.has(key(bottom))) {
      getOrAddBoderTile(borderTiles, pt).bottom = true;
    }
    if (!region.has(key(left))) {
      getOrAddBoderTile(borderTiles, pt).left = true;
    }
    if (!region.has(key(right))) {
      getOrAddBoderTile(borderTiles, pt).right = true;
    }
  }

  for (const k of region) {
    const pt = parseKey(k);
    const top: Point = { x: pt.x, y: pt.y - 1 };
    const bottom: Point = { x: pt.x, y: pt.y + 1 };
    const right: Point = { x: pt.x + 1, y: pt.y };
    const left: Point = { x: pt.x - 1, y: pt.y };
    const topBorderTile = borderTiles.get(key(top)) ?? null;
    const bottomBorderTile = borderTiles.get(key(bottom)) ?? null;
    const rightBorderTile = borderTiles.get(key(right)) ?? null;
    const leftBorderTile = borderTiles.get(key(left)) ?? null;
    if (
      topBorderTile &&
      topBorderTile.left &&
      leftBorderTile &&
      leftBorderTile.top
    ) {
      getOrAddCornerTile(cornerTiles, pt).topLeft = true;
    }
    if (
      topBorderTile &&
      topBorderTile.right &&
      rightBorderTile &&
      rightBorderTile.top
    ) {
      getOrAddCornerTile(cornerTiles, pt).topRight = true;
    }
    if (
      bottomBorderTile &&
      bottomBorderTile.left &&
      leftBorderTile &&
      leftBorderTile.bottom
    ) {
      getOrAddCornerTile(cornerTiles, pt).bottomLeft = true;
    }
    if (
      bottomBorderTile &&
      bottomBorderTile.right &&
      rightBorderTile &&
      rightBorderTile.bottom
    ) {
      getOrAddCornerTile(cornerTiles, pt).bottomRight = true;
    }
  }

  return {
    borderTiles: [...borderTiles.values()],
    cornerTiles: [...cornerTiles.values()],
  };
}

interface DataEntry {
  region: Set<string>;
  borderTiles: BorderTile[];
  cornerTiles: CornerTile[];
}

function hslToRgb(h: number, s: number, l: number) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hueToRgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function toShuffled<T>(array: T[]): T[] {
  let copy = [...array];
  let currentIndex = array.length;

  while (currentIndex !== 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [copy[currentIndex], copy[randomIndex]] = [
      copy[randomIndex],
      copy[currentIndex],
    ];
  }
  return copy;
}

function getColors(regions: number) {
  let result: number[] = Array(regions).fill(0);
  let diff = 360 / regions;
  for (let i = 0; i < regions; ++i) {
    result[i] = i * diff;
  }
  return toShuffled(result);
}

function buildSvg(
  regions: DataEntry[],
  colors: number[],
  width: number,
  height: number,
  highlight: number,
  total: number,
  hideCounter: boolean,
): string {
  let result = [];
  result.push(`<?xml version="1.0" standalone="no"?>\n`);
  result.push(
    `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">`,
  );
  const topOffset = hideCounter ? 0 : TOTAL_ROW_HEIGHT;
  result.push(
    `<svg width="${width / 2}" height="${(height + topOffset) / 2}" viewBox="0 0 ${width} ${height + topOffset}" xmlns="http://www.w3.org/2000/svg">`,
  );
  result.push(
    `<rect width="${width}" height="${height + topOffset}" x="0" y="0" fill="#333" />`,
  );
  if (!hideCounter) {
    result.push(
      `<text x="50" y="${topOffset - 50}" style="fill:#eee;" font-family="monospace" font-size="${topOffset - 20}px">${total}</text>`,
    );
  }
  for (let i = 0; i < regions.length; ++i) {
    const { region, borderTiles, cornerTiles } = regions[i];
    const color = colors[i];
    const isHighlighted = i === highlight;
    const [r, g, b] = hslToRgb(color / 360, 1, isHighlighted ? 0.8 : 0.5);
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    const [r2, g2, b2] = hslToRgb(color / 360, 0.4, isHighlighted ? 0.5 : 0.2);
    const hex2 = `#${r2.toString(16).padStart(2, "0")}${g2.toString(16).padStart(2, "0")}${b2.toString(16).padStart(2, "0")}`;

    for (const k of region) {
      const pt = parseKey(k);
      const tdx = pt.x * TOTAL_TILE_SIZE;
      const tdy = pt.y * TOTAL_TILE_SIZE + topOffset;

      result.push(
        `<rect fill="${hex2}" x="${tdx}" y="${tdy}" width="${TOTAL_TILE_SIZE}" height="${TOTAL_TILE_SIZE}" />`,
      );
    }

    for (const border of borderTiles) {
      if (border.top) {
        const y =
          topOffset +
          border.point.y * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS / 2;
        const x1 =
          border.point.x * TOTAL_TILE_SIZE +
          (border.left ? EXTERNAL_GAP + FENCE_THICKNESS / 2 : 0);
        const x2 =
          (border.point.x + 1) * TOTAL_TILE_SIZE -
          (border.right ? EXTERNAL_GAP + FENCE_THICKNESS / 2 : 0);
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${x1}" x2="${x2}" y1="${y}" y2="${y}" />`,
        );
      }
      if (border.bottom) {
        const y =
          topOffset +
          border.point.y * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS * 1.5 +
          INTERNAL_GAP * 2;
        const x1 =
          border.point.x * TOTAL_TILE_SIZE + (border.left ? EXTERNAL_GAP : 0);
        const x2 =
          (border.point.x + 1) * TOTAL_TILE_SIZE -
          (border.right ? EXTERNAL_GAP : 0);
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${x1}" x2="${x2}" y1="${y}" y2="${y}" />`,
        );
      }
      if (border.left) {
        const x =
          border.point.x * TOTAL_TILE_SIZE + EXTERNAL_GAP + FENCE_THICKNESS / 2;
        const y1 =
          topOffset +
          border.point.y * TOTAL_TILE_SIZE +
          (border.top ? EXTERNAL_GAP : 0);
        const y2 =
          topOffset +
          (border.point.y + 1) * TOTAL_TILE_SIZE -
          (border.bottom ? EXTERNAL_GAP : 0);
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${x}" x2="${x}" y1="${y1}" y2="${y2}" />`,
        );
      }
      if (border.right) {
        const x =
          border.point.x * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS * 1.5 +
          INTERNAL_GAP * 2;
        const y1 =
          topOffset +
          border.point.y * TOTAL_TILE_SIZE +
          (border.top ? EXTERNAL_GAP : 0);
        const y2 =
          topOffset +
          (border.point.y + 1) * TOTAL_TILE_SIZE -
          (border.bottom ? EXTERNAL_GAP : 0);
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${x}" x2="${x}" y1="${y1}" y2="${y2}" />`,
        );
      }
    }

    for (const corner of cornerTiles) {
      if (corner.topLeft) {
        const vx =
          corner.point.x * TOTAL_TILE_SIZE + EXTERNAL_GAP + FENCE_THICKNESS / 2;
        const vy1 = corner.point.y * TOTAL_TILE_SIZE + topOffset;
        const vy2 =
          topOffset +
          corner.point.y * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS;
        const hy =
          topOffset +
          corner.point.y * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS / 2;
        const hx1 = corner.point.x * TOTAL_TILE_SIZE;
        const hx2 =
          corner.point.x * TOTAL_TILE_SIZE + EXTERNAL_GAP + FENCE_THICKNESS;
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${vx}" x2="${vx}" y1="${vy1}" y2="${vy2}" />`,
        );
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${hx1}" x2="${hx2}" y1="${hy}" y2="${hy}" />`,
        );
      }
      if (corner.topRight) {
        const vx =
          corner.point.x * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS * 1.5 +
          2 * INTERNAL_GAP;
        const vy1 = corner.point.y * TOTAL_TILE_SIZE + topOffset;
        const vy2 =
          corner.point.y * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS +
          topOffset;
        const hy =
          topOffset +
          corner.point.y * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS / 2;
        const hx1 = (corner.point.x + 1) * TOTAL_TILE_SIZE;
        const hx2 =
          (corner.point.x + 1) * TOTAL_TILE_SIZE -
          EXTERNAL_GAP -
          FENCE_THICKNESS;
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${vx}" x2="${vx}" y1="${vy1}" y2="${vy2}" />`,
        );
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${hx1}" x2="${hx2}" y1="${hy}" y2="${hy}" />`,
        );
      }
      if (corner.bottomLeft) {
        const vx =
          corner.point.x * TOTAL_TILE_SIZE + EXTERNAL_GAP + FENCE_THICKNESS / 2;
        const vy1 = (corner.point.y + 1) * TOTAL_TILE_SIZE + topOffset;
        const vy2 =
          topOffset +
          (corner.point.y + 1) * TOTAL_TILE_SIZE -
          EXTERNAL_GAP -
          FENCE_THICKNESS;
        const hy =
          topOffset +
          corner.point.y * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS * 1.5 +
          2 * INTERNAL_GAP;
        const hx1 = corner.point.x * TOTAL_TILE_SIZE;
        const hx2 =
          corner.point.x * TOTAL_TILE_SIZE + EXTERNAL_GAP + FENCE_THICKNESS;
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${vx}" x2="${vx}" y1="${vy1}" y2="${vy2}" />`,
        );
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${hx1}" x2="${hx2}" y1="${hy}" y2="${hy}" />`,
        );
      }
      if (corner.bottomRight) {
        const vx =
          corner.point.x * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS * 1.5 +
          2 * INTERNAL_GAP;
        const vy1 = (corner.point.y + 1) * TOTAL_TILE_SIZE + topOffset;
        const vy2 =
          topOffset +
          (corner.point.y + 1) * TOTAL_TILE_SIZE -
          EXTERNAL_GAP -
          FENCE_THICKNESS;
        const hy =
          topOffset +
          corner.point.y * TOTAL_TILE_SIZE +
          EXTERNAL_GAP +
          FENCE_THICKNESS * 1.5 +
          2 * INTERNAL_GAP;
        const hx1 = (corner.point.x + 1) * TOTAL_TILE_SIZE;
        const hx2 =
          (corner.point.x + 1) * TOTAL_TILE_SIZE -
          EXTERNAL_GAP -
          FENCE_THICKNESS;
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${vx}" x2="${vx}" y1="${vy1}" y2="${vy2}" />`,
        );
        result.push(
          `<line style="stroke:${hex};stroke-width:${FENCE_THICKNESS}" x1="${hx1}" x2="${hx2}" y1="${hy}" y2="${hy}" />`,
        );
      }
    }
  }
  result.push(`</svg>`);
  return result.join("\n");
}

async function writeSvgz(svg: string, path: string) {
  const gzipped = await new Promise<Buffer>((resolve, reject) => {
    gzip(Buffer.from(svg), { level: 9 }, (error, result) => {
      if (error) {
        return void reject(error);
      }
      resolve(result);
    });
  });
  await fsp.writeFile(path, gzipped);
}

async function main() {
  const args = arg({
    "--input": String,
    "--output": String,
    "--hide-counter": Boolean,
    "--one-frame": Boolean,
    "-i": "--input",
    "-o": "--output",
    "-H": "--hide-counter",
    "-O": "--one-frame",
  });

  const input = args["--input"];
  const output = args["--output"];
  const hide = Boolean(args["--hide-counter"] || args["--one-frame"]);
  const oneFrame = Boolean(args["--one-frame"]);

  assert(input, "--input/-i is provided");
  assert(output, "--output/-o is provided");

  const inputData = await fsp.readFile(input, "utf-8");
  const grid = ContinousGrid.parseCharGrid(inputData);
  const regions = getRegions(grid);
  const withSegments = regions.map(
    (region): DataEntry => ({
      region,
      ...getTiles(region),
    }),
  );

  const colors = getColors(regions.length);
  const promises: Array<Promise<any>> = [];

  const svg = buildSvg(
    withSegments,
    colors,
    grid.width * TOTAL_TILE_SIZE,
    grid.height * TOTAL_TILE_SIZE,
    -1,
    0,
    hide,
  );

  if (!oneFrame) {
    await fsp.mkdir(output, { recursive: true });
  }
  promises.push(
    writeSvgz(svg, oneFrame ? output : p.join(output, `0000.svgz`)),
  );
  if (oneFrame) {
    await Promise.all(promises);
    return;
  }
  let total = 0;

  for (let i = 0; i < regions.length; ++i) {
    let sideCount = sides(regions[i]);
    total += sideCount * regions[i].size;
    const svg = buildSvg(
      withSegments,
      colors,
      grid.width * TOTAL_TILE_SIZE,
      grid.height * TOTAL_TILE_SIZE,
      i,
      total,
      hide,
    );
    promises.push(
      writeSvgz(
        svg,
        p.join(output, `${(i + 1).toString().padStart(5, "0")}.svgz`),
      ),
    );
    if ((i + 1) % 10 === 0 || i + 1 === regions.length) {
      console.log(`${i + 1}/${regions.length}`);
    }
  }

  await Promise.all([promises]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
