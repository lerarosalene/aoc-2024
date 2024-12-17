export enum OpCode {
  ADV = 0,
  BXL = 1,
  BST = 2,
  JNZ = 3,
  BXC = 4,
  OUT = 5,
  BDV = 6,
  CDV = 7,
}

export const COMBO_OPCODES = [
  OpCode.ADV,
  OpCode.BST,
  OpCode.OUT,
  OpCode.BDV,
  OpCode.CDV,
];
