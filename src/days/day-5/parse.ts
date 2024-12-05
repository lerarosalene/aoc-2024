import { lines } from "../../common/utils";

export interface Rule {
  first: number;
  second: number;
}

function parseRules(input: string): Rule[] {
  return lines(input).map((l) => {
    const [first, second] = l.split("|");
    return { first: Number(first), second: Number(second) };
  });
}

function parseUpdates(input: string) {
  return lines(input).map((l) => l.split(",").map((page) => Number(page)));
}

export function parse(input: string) {
  const [rulesRaw, updatesRaw] = input.split("\n\n");
  return { rules: parseRules(rulesRaw), updates: parseUpdates(updatesRaw) };
}
