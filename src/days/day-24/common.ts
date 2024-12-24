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

export function x(index: number) {
  return `x${index.toString().padStart(2, "0")}`;
}

export function y(index: number) {
  return `y${index.toString().padStart(2, "0")}`;
}

export function z(index: number) {
  return `z${index.toString().padStart(2, "0")}`;
}
