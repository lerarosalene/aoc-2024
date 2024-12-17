import assert from "node:assert";
import { lines } from "../../common/utils";
import { COMBO_OPCODES, OpCode } from "./opcodes";
import { compile } from "./compiler";

export type Registers = [bigint, bigint, bigint];

export interface Program {
  registers: Registers;
  bytecode: number[];
}

export function parse(input: string): Program {
  const [registersChunk, bytecodeChunk] = input
    .split("\n\n")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length);

  const registers = lines(registersChunk).map((line) =>
    BigInt(line.split(":")[1].trim()),
  );
  assert.equal(registers.length, 3, "there should be 3 registers");

  const bytecode = bytecodeChunk
    .split(":")[1]
    .trim()
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i.length)
    .map((i) => Number(i));

  return { registers: registers as Registers, bytecode };
}

function lastMatchLength(program: Program, output: number[]) {
  for (let i = 0; i < output.length; ++i) {
    if (
      output[output.length - 1 - i] !==
      program.bytecode[program.bytecode.length - 1 - i]
    ) {
      return i;
    }
  }
  return output.length;
}

export function partOne(input: string) {
  const program = parse(input);
  const f = compile(program);
  return f().join(",");
}

export function partTwo(input: string) {
  const program = parse(input);
  const f = compile(program);
  let current = [0n];
  for (let digit = 0; digit < program.bytecode.length; ++digit) {
    let next: bigint[] = [];
    for (const prefix of current) {
      for (let i = 0n; i < 8n; ++i) {
        const candidate = prefix * 8n + i;
        const result = f(candidate);
        const matchCount = lastMatchLength(program, result);
        if (matchCount === digit + 1) {
          next.push(candidate);
        }
      }
    }
    current = next;
  }

  let minResult = current[0];
  for (let i = 1; i < current.length; ++i) {
    if (minResult > current[i]) {
      minResult = current[i];
    }
  }

  return minResult;
}
