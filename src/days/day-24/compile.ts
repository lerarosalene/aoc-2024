import assert from "node:assert";
import { Formula, Operator, Wire } from "./common";

interface WireNode {
  type: "wire";
  name: string;
}

interface OperatorNode {
  type: "operator";
  left: FormulaNode;
  right: FormulaNode;
  operator: Operator;
}

type FormulaNode = WireNode | OperatorNode;

export class Resolver {
  constructor(private _map: Map<string, Formula>) {}
  private _cache = new Map<string, FormulaNode>();

  public resolve(wire: string, visited = new Set<Formula>()): FormulaNode {
    const cached = this._cache.get(wire);
    if (cached !== undefined) {
      return cached;
    }
    if (/^(?:x|y)\d\d$/.test(wire)) {
      return { type: "wire", name: wire };
    }

    const formula = this._map.get(wire);
    assert(formula);
    if (visited.has(formula)) {
      throw new Error("Cycle detected");
    }
    const result: FormulaNode = {
      type: "operator",
      operator: formula.operator,
      left: this.resolve(formula.left, new Set([...visited, formula])),
      right: this.resolve(formula.right, new Set([...visited, formula])),
    };
    this._cache.set(wire, result);
    return result;
  }
}

class Evaluator {
  constructor(inputs: Wire[]) {
    for (const wire of inputs) {
      this._inputs.set(wire.name, wire.value);
    }
  }

  private _inputs = new Map<string, boolean>();
  private _cache = new Map<FormulaNode, boolean>();

  public evaluate(node: FormulaNode): boolean {
    const cached = this._cache.get(node);
    if (cached !== undefined) {
      return cached;
    }

    if (node.type === "wire") {
      const result = this._inputs.get(node.name);
      assert(result !== undefined);
      this._cache.set(node, result);
      return result;
    }

    const lhs = this.evaluate(node.left);
    const rhs = this.evaluate(node.right);
    let result: boolean | null = null;
    switch (node.operator) {
      case "AND":
        result = lhs && rhs;
        break;
      case "OR":
        result = lhs || rhs;
        break;
      case "XOR":
        result = lhs !== rhs;
        break;
      default:
        let _: never = node.operator;
        throw new Error("Unreachable");
    }

    assert(result !== undefined);
    this._cache.set(node, result);
    return result;
  }
}

export function compile(formulas: Formula[]) {
  const formulaMap = new Map<string, Formula>();
  for (const formula of formulas) {
    formulaMap.set(formula.result, formula);
  }

  return new Resolver(formulaMap);
}

export function evaluate(resolver: Resolver, input: Wire[]) {
  const evaluator = new Evaluator(input);
  let result = 0;

  for (let i = 45; i >= 0; --i) {
    const wire = `z${i.toString().padStart(2, "0")}`;
    result = result * 2 + (evaluator.evaluate(resolver.resolve(wire)) ? 1 : 0);
  }

  return result;
}
