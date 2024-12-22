import assert from "node:assert";
import p from "node:path";
import fs from "node:fs";
import arg from "arg";
import { KeypadType } from "../keypad";
import { draw } from "./render";
import { Keypad, Robot } from "./robot";
import { VerboseSolver } from "./verbose-solver";

const fsp = fs.promises;

class FrameNamer {
  private index = 0;

  getNextName() {
    let result = `${String(this.index).padStart(5, "0")}.svg`;
    this.index++;
    return result;
  }
}

async function main() {
  const args = arg({
    "--input": String,
    "--output": String,
    "-o": "--output",
    "-i": "--input",
  });

  const input = args["--input"];
  const output = args["--output"];
  assert(output, "output location is given");
  assert(input, "target is given");

  const solver = new VerboseSolver();
  const target = input;
  const sequence = solver.solve(target, 2, 0);

  const robots = [
    new Robot(KeypadType.DIRECTIONAL, "A"),
    new Robot(KeypadType.DIRECTIONAL, "A"),
    new Robot(KeypadType.NUMERIC, "A"),
  ];

  const kp = new Keypad();
  for (let i = 1; i < robots.length; ++i) {
    robots[i - 1].connect(robots[i]);
  }
  robots[robots.length - 1].connect(kp);

  await fsp.mkdir(output, { recursive: true });
  const frameNamer = new FrameNamer();
  let frame: string | null = null;
  for (const symbol of sequence) {
    robots[0].command(symbol);
    for (let flash of [false, true, false]) {
      frame = draw(symbol, robots, kp, flash);
      const name = frameNamer.getNextName();
      const framePath = p.join(output, name);
      await fsp.writeFile(framePath, frame);
    }
    for (const robot of robots) {
      robot.resetHighlight();
    }
  }

  for (let i = 0; i < 30; ++i) {
    const name = frameNamer.getNextName();
    const framePath = p.join(output, name);
    await fsp.writeFile(framePath, frame ?? "");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
