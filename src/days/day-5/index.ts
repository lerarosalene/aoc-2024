import assert from "../../vendor/assert";
import { Rule, parse } from "./parse";
import { Orderer } from "./order";

function validate(rule: Rule, update: number[]) {
  const firstIndex = update.indexOf(rule.first);
  const secondIndex = update.indexOf(rule.second);
  if (firstIndex === -1 || secondIndex === -1) {
    return true;
  }
  return firstIndex < secondIndex;
}

export function partOne(input: string) {
  const { rules, updates } = parse(input);
  const validUpdates = updates.filter((update) =>
    rules.every((rule) => validate(rule, update)),
  );

  let result = 0;
  for (let update of validUpdates) {
    assert(update.length % 2 === 1, "update must have odd number of pages");
    result += update[(update.length - 1) / 2];
  }
  return result;
}

export function partTwo(input: string) {
  const { rules, updates } = parse(input);
  const invalidUpdates = updates.filter((update) =>
    rules.some((rule) => !validate(rule, update)),
  );
  const orderer = new Orderer(rules);
  const fixedUpdates = invalidUpdates.map((update) =>
    orderer.forceOrder(update),
  );
  let result = 0;
  for (let update of fixedUpdates) {
    assert(update.length % 2 === 1, "update must have odd number of pages");
    result += update[(update.length - 1) / 2];
  }
  return result;
}
