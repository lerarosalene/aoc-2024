import { lines } from "../../common/utils";
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
  if (registers.length !== 3) {
    throw new Error("there should be 3 registers");
  }

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

function debugPrint(number: bigint) {
  return number.toString(8);
}

interface DFSParams {
  f: Function;
  program: Program;
  prefix: bigint;
  digit: number;
}

function dfs(params: DFSParams): number {
  const { f, program, prefix, digit } = params;
  for (let i = 0n; i < 8n; ++i) {
    const candidate = prefix * 8n + i;
    const result = f(candidate);
    const matchCount = lastMatchLength(program, result);
    if (
      matchCount === program.bytecode.length &&
      result.length === program.bytecode.length
    ) {
      return Number(candidate);
    }
    if (matchCount === digit + 1) {
      const next = dfs({ f, program, prefix: candidate, digit: digit + 1 });
      if (next > -1) {
        return next;
      }
    }
  }
  return -1;
}

export function partTwo(input: string) {
  const program = parse(input);
  const f = compile(program);
  return dfs({ f, program, prefix: 0n, digit: 0 });
}
