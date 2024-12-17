import { COMBO_OPCODES, OpCode } from "./opcodes";
import type { Program, Registers } from ".";

const preamble = (registers: Registers) => [
  `let a = ${registers[0]}n, b = ${registers[1]}n, c = ${registers[2]}n;`,
  `let result = [];`,
  `if (override !== undefined && override !== null) {`,
  `a = override;`,
  `}`,
  `let state = 0;`,
  `while (state > -1) {`,
  `switch(state){`,
];

const footer = `}}return result;`;

interface Instruction {
  opcode: OpCode;
  operand: number;
}

interface CFGNode {
  id: number;
  origStart: number;
  instructions: Instruction[];
}

function debugSerializeOperand(opcode: number, operand: number) {
  if (!COMBO_OPCODES.includes(opcode)) {
    return `${operand}`;
  }
  if (operand < 4) {
    return `${operand}`;
  }
  if (operand > 6) {
    throw new Error(`Illegal operand ${operand}`);
  }
  return ["A", "B", "C"][operand - 4];
}

function debugSerializeInstruction(opcode: number, operand: number) {
  const operation = OpCode[opcode]?.toLowerCase() ?? null;
  if (!operation) {
    throw new Error(`illegal opcode ${opcode}`);
  }
  return `${operation} ${debugSerializeOperand(opcode, operand)}`;
}

export function debugPrint(cfg: CFGNode[]) {
  let result: string[] = [];
  for (const node of cfg) {
    result.push(`Node #${node.id}:`);
    for (let i = 0; i < node.instructions.length; ++i) {
      let instruction = node.instructions[i];
      let origIndex = i + node.origStart;
      result.push(
        `${origIndex.toString().padStart(8, "0")}: ${debugSerializeInstruction(instruction.opcode, instruction.operand)}`,
      );
    }
    result.push("");
  }
  return result.join("\n");
}

function serializeOperand(opcode: number, operand: number) {
  if (!COMBO_OPCODES.includes(opcode)) {
    return `${operand}n`;
  }
  if (operand < 4) {
    return `${operand}n`;
  }
  if (operand > 6) {
    throw new Error(`Illegal operand ${operand}`);
  }
  return ["a", "b", "c"][operand - 4];
}

function compileNode(
  node: CFGNode,
  jmpMap: Map<number, number>,
  isLast: boolean,
) {
  const code = [];
  code.push(`case ${node.id}:`);
  for (let instruction of node.instructions) {
    const { opcode, operand } = instruction;
    switch (opcode) {
      case OpCode.ADV: {
        code.push(`a /= (2n ** ${serializeOperand(opcode, operand)});`);
        break;
      }
      case OpCode.BDV: {
        code.push(`b = a / (2n ** ${serializeOperand(opcode, operand)});`);
        break;
      }
      case OpCode.CDV: {
        code.push(`c = a / (2n ** ${serializeOperand(opcode, operand)});`);
        break;
      }
      case OpCode.OUT: {
        code.push(
          `result.push(Number(${serializeOperand(opcode, operand)} % 8n));`,
        );
        break;
      }
      case OpCode.BXL: {
        code.push(`b ^= ${serializeOperand(opcode, operand)};`);
        break;
      }
      case OpCode.BST: {
        code.push(`b = ${serializeOperand(opcode, operand)} % 8n;`);
        break;
      }
      case OpCode.BXC: {
        code.push(`b = b ^ c;`);
        break;
      }
      case OpCode.JNZ: {
        code.push(
          `state = a ? ${jmpMap.get(instruction.operand) ?? -1} : ${isLast ? -1 : "state + 1"};`,
        );
        break;
      }
      default:
        let _: never = opcode;
    }
  }
  code.push(`break;`);
  return code;
}

export function compileToCode(program: Program) {
  let code = preamble(program.registers);
  let instructions: Instruction[] = [];
  for (let i = 0; i < program.bytecode.length; i += 2) {
    instructions.push({
      opcode: program.bytecode[i],
      operand: program.bytecode[i + 1],
    });
  }

  let dividers = new Set<number>();
  for (let i = 0; i < instructions.length; ++i) {
    const instruction = instructions[i];
    if (instruction.opcode === OpCode.JNZ) {
      const toIndex = instruction.operand / 2;
      dividers.add(toIndex);
      dividers.add(i + 1);
    }
  }

  let nodes: CFGNode[] = [];
  let last: CFGNode = { id: 0, origStart: 0, instructions: [] };
  for (let i = 0; i < instructions.length; ++i) {
    const instruction = instructions[i];
    if (dividers.has(i) && i !== 0) {
      nodes.push(last);
      last = { id: last.id + 1, origStart: i, instructions: [] };
    }
    last.instructions.push(instruction);
  }
  nodes.push(last);

  let jmpMap = new Map<number, number>();
  for (let node of nodes) {
    jmpMap.set(node.origStart * 2, node.id);
  }

  for (let i = 0; i < nodes.length; ++i) {
    code = [...code, ...compileNode(nodes[i], jmpMap, i === nodes.length - 1)];
  }

  code.push(footer);

  return code.join("");
}

export function compile(program: Program) {
  return new Function("override", compileToCode(program));
}
