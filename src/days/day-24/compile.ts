import { Formula, Operator } from "./common";

function compileOperator(operator: Operator) {
  switch (operator) {
    case "AND":
      return "&&";
    case "OR":
      return "||";
    case "XOR":
      return "!==";
    default:
      let _: never = operator;
      throw new Error("Unknown operator " + operator);
  }
}

type Func = (
  inputs: Partial<Record<string, boolean>>,
) => Partial<Record<string, boolean>>;

export function compile(formulas: Formula[]): Func {
  let result: string[] = [];

  result.push(`let nodes = {...inputs};`);

  let remaining: Formula[] = formulas;
  let computed = new Set<string>();

  let loopCanary = false;
  while (remaining.length > 0) {
    if (loopCanary) {
      throw new Error("Circuit can not be compiled. Check for loops");
    }
    loopCanary = true;
    let next: Formula[] = [];
    for (const formula of remaining) {
      const isLeftComputed =
        computed.has(formula.left) || /^(?:x|y)\d\d$/.test(formula.left);
      const isRightComputed =
        computed.has(formula.right) || /^(?:x|y)\d\d$/.test(formula.right);
      const canBeComputed = isLeftComputed && isRightComputed;
      if (canBeComputed) {
        result.push(
          `nodes["${formula.result}"] = nodes["${formula.left}"] ${compileOperator(formula.operator)} nodes["${formula.right}"];`,
        );
        computed.add(formula.result);
        loopCanary = false;
      } else {
        next.push(formula);
      }
    }
    remaining = next;
  }

  result.push(`return nodes;`);

  return new Function("inputs", result.join("\n")) as Func;
}
