import { lines } from "../../common/utils";
import { SkipArray } from "./SkipArray";

function parse(input: string) {
  return lines(input).map((line) =>
    line
      .split(/\s+/g)
      .map((level) => level.trim())
      .filter((level) => level.length > 0)
      .map((level) => Number(level)),
  );
}

function isSafe(report: number[], skip = -1): boolean {
  const skipped = new SkipArray(report, skip);
  if (skipped.length < 2) {
    return true;
  }
  const direction = Math.sign(skipped.at(1) - skipped.at(0));
  for (let i = 1; i < skipped.length; ++i) {
    const prev = skipped.at(i - 1);
    const next = skipped.at(i);
    if (Math.sign(next - prev) !== direction) {
      return false;
    }
    const diff = Math.abs(next - prev);
    if (diff < 1 || diff > 3) {
      return false;
    }
  }
  return true;
}

function isTolerable(report: number[]): boolean {
  if (isSafe(report)) {
    return true;
  }
  for (let i = 0; i < report.length; ++i) {
    if (isSafe(report, i)) {
      return true;
    }
  }
  return false;
}

export function partOne(input: string) {
  const reports = parse(input);
  return reports.reduce((acc, report) => acc + (isSafe(report) ? 1 : 0), 0);
}

export function partTwo(input: string) {
  const reports = parse(input);
  return reports.reduce(
    (acc, report) => acc + (isTolerable(report) ? 1 : 0),
    0,
  );
}
