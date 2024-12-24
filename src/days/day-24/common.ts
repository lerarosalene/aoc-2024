export interface Wire {
  name: string;
  value: boolean;
}

export type Operator = "AND" | "OR" | "XOR";

export function isOperator(op: string): op is Operator {
  return ["AND", "OR", "XOR"].includes(op);
}

export interface Formula {
  left: string;
  right: string;
  result: string;
  operator: Operator;
}
