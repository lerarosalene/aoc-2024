import type { Rule } from "./parse";

export class Orderer {
  private _rules = new Map<number, Map<number, number>>();

  constructor(rules: Rule[]) {
    for (const rule of rules) {
      this._addRule(rule.first, rule.second);
    }
  }

  private _addRule(first: number, second: number) {
    let firstBucket = this._rules.get(first);
    if (!firstBucket) {
      firstBucket = new Map();
      this._rules.set(first, firstBucket);
    }
    firstBucket.set(second, -1);
    let secondBucket = this._rules.get(second);
    if (!secondBucket) {
      secondBucket = new Map();
      this._rules.set(second, secondBucket);
    }
    secondBucket.set(first, 1);
  }

  private _compare(a: number, b: number) {
    const result = this._rules.get(a)?.get(b);
    if (result !== undefined) {
      return result;
    }
    // here we rely on list of rules having every single possible pair of numbers
    // that's never explicitly stated in the puzzle but seems to be the case
    throw new Error("Unknown ordering");
  }

  public forceOrder(update: number[]) {
    return [...update].sort((a, b) => this._compare(a, b));
  }
}
