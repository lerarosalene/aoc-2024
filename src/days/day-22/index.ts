import assert from "node:assert";
import { lines } from "../../common/utils";

function evolve(x: number) {
  x = ((x << 6) ^ x) & 16777215;
  x = ((x >> 5) ^ x) & 16777215;
  x = ((x << 11) ^ x) & 16777215;
  return x;
}

function sequenceKey(sequence: number[]): number {
  assert(sequence.length === 4);
  return (
    (sequence[0] + 10) * 8000 +
    (sequence[1] + 10) * 400 +
    (sequence[2] + 10) * 20 +
    (sequence[3] + 10)
  );
}

function addSequences(counter: Map<number, number>, buyer: number) {
  let last = buyer;
  let sequence: number[] = [];
  let visited = new Set<number>();
  for (let i = 0; i < 2000; ++i) {
    let next = evolve(last);
    sequence.push((next % 10) - (last % 10));
    last = next;
    if (sequence.length > 4) {
      sequence = sequence.slice(sequence.length - 4);
    }
    if (sequence.length < 4) {
      continue;
    }
    const sKey = sequenceKey(sequence);
    if (visited.has(sKey)) {
      continue;
    }
    visited.add(sKey);
    counter.set(sKey, (counter.get(sKey) ?? 0) + (last % 10));
  }
}

export function partOne(input: string) {
  const buyers = lines(input).map((line) => Number(line));
  let result = 0;

  for (let buyer of buyers) {
    for (let i = 0; i < 2000; ++i) {
      buyer = evolve(buyer);
    }
    result += buyer;
  }

  return result;
}

export function partTwo(input: string) {
  const buyers = lines(input).map((line) => Number(line));
  const mapping = new Map<number, number>();
  for (let buyer of buyers) {
    addSequences(mapping, buyer);
  }
  let maxBananas = 0;
  for (let bananas of mapping.values()) {
    if (bananas > maxBananas) {
      maxBananas = bananas;
    }
  }
  return maxBananas;
}
