import assert from "node:assert";
import { lines } from "../../common/utils";

type Registers = [bigint, bigint, bigint];

interface Program {
  registers: Registers;
  bytecode: number[];
}

function parse(input: string): Program {
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

enum OpCode {
  ADV = 0,
  BXL = 1,
  BST = 2,
  JNZ = 3,
  BXC = 4,
  OUT = 5,
  BDV = 6,
  CDV = 7,
}

const COMBO_OPCODES = [
  OpCode.ADV,
  OpCode.BST,
  OpCode.OUT,
  OpCode.BDV,
  OpCode.CDV,
];

class Runner {
  private bytecode: number[];
  private registers: Registers;

  private get a() {
    return this.registers[0];
  }

  private set a(value: bigint) {
    this.registers[0] = value;
  }

  private get b() {
    return this.registers[1];
  }

  private set b(value: bigint) {
    this.registers[1] = value;
  }

  private get c() {
    return this.registers[2];
  }

  private set c(value: bigint) {
    this.registers[2] = value;
  }

  constructor(program: Program, override?: bigint) {
    this.bytecode = program.bytecode;
    this.registers = [...program.registers];
    if (override !== undefined) {
      this.a = override;
    }
  }

  private getOperand(opcode: number, rawOperand: number) {
    if (!COMBO_OPCODES.includes(opcode)) {
      return BigInt(rawOperand);
    }
    if (rawOperand < 4) {
      return BigInt(rawOperand);
    }
    if (rawOperand > 6) {
      throw new Error(`invalid combo opcode: ${opcode}`);
    }
    return this.registers[rawOperand - 4];
  }

  public run() {
    let result: number[] = [];
    let ptr = 0;
    while (ptr < this.bytecode.length - 1) {
      assert.equal(ptr % 2, 0, "instruction pointer alignment broken");
      const opcode = this.bytecode[ptr];
      const operand = this.getOperand(opcode, this.bytecode[ptr + 1]);

      switch (opcode) {
        case OpCode.ADV: {
          this.a = this.a / 2n ** operand;
          break;
        }
        case OpCode.BDV: {
          this.b = this.a / 2n ** operand;
          break;
        }
        case OpCode.CDV: {
          this.c = this.a / 2n ** operand;
          break;
        }
        case OpCode.BXL: {
          this.b = this.b ^ operand;
          break;
        }
        case OpCode.BST: {
          this.b = operand % 8n;
          break;
        }
        case OpCode.BXC: {
          this.b = this.b ^ this.c;
          break;
        }
        case OpCode.OUT: {
          result.push(Number(operand % 8n));
          break;
        }
        case OpCode.JNZ: {
          if (this.a !== 0n) {
            ptr = Number(operand);
            continue;
          }
          break;
        }
        default: {
          throw new Error(`Illegal opcode: ${opcode}`);
        }
      }

      ptr += 2;
    }

    return result;
  }

  public static run(program: Program, override?: bigint) {
    return new Runner(program, override).run();
  }
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
  return Runner.run(program).join(",");
}

export function partTwo(input: string) {
  const program = parse(input);
  let current = [0n];
  let tripletCount = Math.floor(program.bytecode.length / 3);
  for (let triplet = 0; triplet < tripletCount; ++triplet) {
    let next: bigint[] = [];
    for (const prefix of current) {
      for (let i = 0n; i < 8n ** 3n; ++i) {
        const candidate = prefix * 8n ** 3n + i;
        const result = Runner.run(program, candidate);
        const matchCount = lastMatchLength(program, result);
        if (matchCount === program.bytecode.length) {
          return candidate;
        }
        if (matchCount === (triplet + 1) * 3) {
          next.push(candidate);
        }
      }
    }
    current = next;
  }
  let results: bigint[] = [];
  for (let remainderLength = 1; remainderLength < 4; ++remainderLength) {
    for (const prefix of current) {
      for (
        let lastBit = 0n;
        lastBit < 8n ** BigInt(remainderLength);
        ++lastBit
      ) {
        const candidate = prefix * 8n ** BigInt(remainderLength) + lastBit;
        const result = Runner.run(program, candidate);
        const matchCount = lastMatchLength(program, result);
        if (
          matchCount === program.bytecode.length &&
          result.length === program.bytecode.length
        ) {
          results.push(candidate);
        }
      }
    }
  }
  if (results.length === 0) {
    return -1;
  }
  let minResult = results[0];
  for (let i = 1; i < results.length; ++i) {
    if (minResult > results[i]) {
      minResult = results[i];
    }
  }
  return minResult;
}
