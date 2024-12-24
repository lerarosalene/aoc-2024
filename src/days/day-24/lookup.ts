import { Formula, Operator } from "./common";

export class FormulaLookup {
  private _byResult = new Map<string, Formula>();
  private _byOperand = new Map<string, Formula[]>();
  private _swaps: Map<string, string> = new Map();

  constructor(formulas: Formula[]) {
    for (const formula of formulas) {
      this._byResult.set(formula.result, formula);
      let lBucket = this._byOperand.get(formula.left);
      let rBucket = this._byOperand.get(formula.right);
      if (!lBucket) {
        lBucket = [];
        this._byOperand.set(formula.left, lBucket);
      }
      if (!rBucket) {
        rBucket = [];
        this._byOperand.set(formula.right, rBucket);
      }
      lBucket.push(formula);
      rBucket.push(formula);
    }
  }

  public setSwaps(swaps: [string, string][]) {
    this._swaps.clear();
    for (let [a, b] of swaps) {
      this._swaps.set(a, b);
      this._swaps.set(b, a);
    }
  }

  public findRhs(x: string, y: string, operator: Operator) {
    const candidate = (this._byOperand.get(x) ?? []).find((c) => {
      if (c.operator !== operator) {
        return false;
      }
      if (c.left === x && c.right === y) {
        return true;
      }
      if (c.right === x && c.left === y) {
        return true;
      }
    });
    if (!candidate) {
      return null;
    }
    const rhs = candidate.result;
    return this._swaps.get(rhs) ?? rhs;
  }

  public findOperands(operator: Operator, result: string) {
    const candidate = this._byResult.get(this._swaps.get(result) ?? result);
    if (!candidate) {
      return null;
    }
    if (candidate.operator !== operator) {
      return null;
    }
    return [candidate.left, candidate.right];
  }

  public findOperand(x: string, operator: Operator, result: string) {
    const candidate = this._byResult.get(this._swaps.get(result) ?? result);
    if (!candidate) {
      return null;
    }
    if (candidate.operator !== operator) {
      return null;
    }
    if (candidate.left === x) {
      return candidate.right;
    }
    if (candidate.right === x) {
      return candidate.left;
    }
    return null;
  }
}
