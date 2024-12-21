import { IGrid } from "../../../common/grid";
import { getKeypad, KeypadType } from "../keypad";
import { Keypad, Robot } from "./robot";

const CELL_SIZE = 128;
const GAP = 40;
const FONT_SIZE = 96;
const RESULT_PADDING = 40;
const PADDING_TOP = 40;

const BG_COLOR = "#333";
const FG_COLOR = "#eee";
const ACTIVE_BORDER_COLOR = "red";
const ACTIVE_CELL_COLOR = "green";

function getKeypadSize(grid: IGrid<string>) {
  return { width: grid.width * CELL_SIZE, height: grid.height * CELL_SIZE };
}

function escape(button: string) {
  switch (button) {
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    default:
      return button;
  }
}

function drawKeypad(
  grid: IGrid<string>,
  button: string,
  xOffset: number,
  yOffset: number,
  isHighlighted: boolean,
) {
  let result: string[] = [];
  const { width, height } = getKeypadSize(grid);
  result.push(
    `<rect fill="none" stroke="${FG_COLOR}" stroke-width="2px" x="${xOffset - GAP / 2}" y="${yOffset - GAP / 2}" width="${width + GAP}" height="${height + GAP}" />`,
  );
  for (let x = 0; x < grid.width; ++x) {
    for (let y = 0; y < grid.height; ++y) {
      const letter = grid.at(x, y);
      if (letter === null || letter === ".") {
        continue;
      }
      const isActive = button === letter;
      const textX = x * CELL_SIZE + xOffset + FONT_SIZE * 0.35;
      const textY = y * CELL_SIZE + yOffset + FONT_SIZE * 1;
      if (isActive) {
        result.push(
          `<rect stroke-width="2" fill="${isHighlighted ? ACTIVE_CELL_COLOR : "none"}" stroke="${ACTIVE_BORDER_COLOR}" x="${x * CELL_SIZE + xOffset}" y="${y * CELL_SIZE + yOffset}" width="${CELL_SIZE}" height="${CELL_SIZE}" />`,
        );
      }
      result.push(
        `<text x="${textX}" y="${textY}" fill="${FG_COLOR}" font-family="monospace" font-size="${FONT_SIZE}px">${escape(letter)}</text>`,
      );
    }
  }
  return result.join("\n");
}

export function draw(symbol: string, robots: Robot[], keypad: Keypad) {
  let totalWidth = 0;
  let totalHeight = 0;
  let { width: firstWidth, height: firstHeight } = getKeypadSize(
    getKeypad(KeypadType.DIRECTIONAL),
  );
  totalWidth += firstWidth;
  totalHeight = Math.max(totalHeight, firstHeight);

  for (const robot of robots) {
    let { width, height } = getKeypadSize(robot.grid);
    totalWidth += width;
    totalHeight = Math.max(totalHeight, height);
  }

  totalHeight += FONT_SIZE;
  totalHeight += RESULT_PADDING * 2;
  totalHeight += PADDING_TOP;
  totalWidth += GAP * (robots.length + 2);

  const keypadsHeight = totalHeight - FONT_SIZE - RESULT_PADDING * 2;

  let result: string[] = [];
  result.push(
    `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">`,
  );
  result.push(
    `<svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">`,
  );
  result.push(
    `<rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="${BG_COLOR}" />`,
  );

  let currentRobotX = GAP;
  const { width: firstKpWidth, height: firstKpHeight } = getKeypadSize(
    getKeypad(KeypadType.DIRECTIONAL),
  );
  const y = (keypadsHeight - firstKpHeight) / 2 + PADDING_TOP;
  result.push(
    drawKeypad(
      getKeypad(KeypadType.DIRECTIONAL),
      symbol,
      currentRobotX,
      y,
      true,
    ),
  );
  currentRobotX += firstKpWidth + GAP;

  for (const robot of robots) {
    const { width, height } = getKeypadSize(robot.grid);
    const y = (keypadsHeight - height) / 2 + PADDING_TOP;
    result.push(
      drawKeypad(robot.grid, robot.button, currentRobotX, y, robot.highlighted),
    );
    currentRobotX += width + GAP;
  }

  const resultTextX = totalWidth / 2 - 4 * FONT_SIZE;
  const resultTextY = totalHeight - FONT_SIZE;

  result.push(
    `<text x="${resultTextX}" y="${resultTextY}" fill="${FG_COLOR}" font-family="monospace" font-size="${FONT_SIZE}px">${keypad.contents}</text>`,
  );
  result.push(
    `<rect x="${resultTextX - RESULT_PADDING / 2}" y="${resultTextY - RESULT_PADDING / 2 - FONT_SIZE * 0.8}" fill="none" stroke="${FG_COLOR}" stroke-width="2" width="${3 * FONT_SIZE}" height="${FONT_SIZE + RESULT_PADDING}" />`,
  );

  result.push("</svg>");
  return result.join("\n");
}
