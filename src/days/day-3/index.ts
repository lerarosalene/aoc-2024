const MUL_REGEX_P1 = /mul\((\d+),(\d+)\)/g;
const INSTRUCTION_REGEX_P2 = /mul\((\d+),(\d+)\)|do\(\)|don't\(\)/g;

export function partOne(input: string) {
  const rexp = new RegExp(MUL_REGEX_P1);
  let result = 0;
  let match = null;
  while ((match = rexp.exec(input)) !== null) {
    const [_, a, b] = match;
    result += Number(a) * Number(b);
  }
  return result;
}

export function partTwo(input: string) {
  const rexp = new RegExp(INSTRUCTION_REGEX_P2);
  let result = 0;
  let enabled = true;
  let match = null;
  while ((match = rexp.exec(input)) !== null) {
    const [text, a, b] = match;
    if (text === "do()") {
      enabled = true;
      continue;
    }
    if (text === "don't()") {
      enabled = false;
      continue;
    }
    if (!enabled) {
      continue;
    }
    result += Number(a) * Number(b);
  }
  return result;
}
