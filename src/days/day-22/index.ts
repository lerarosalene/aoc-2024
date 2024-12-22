import assert from "node:assert";
import { lines } from "../../common/utils";

function evolve(x: bigint) {
  x = ((x * 64n) ^ x) % 16777216n;
  x = ((x / 32n) ^ x) % 16777216n;
  x = ((x * 2048n) ^ x) % 16777216n;
  return x;
}

function sequenceKey(sequence: bigint[]) {
  assert(sequence.length === 4);
  return sequence.join(":");
}

function addSequences(counter: Map<string, bigint>, buyer: bigint) {
  let last = buyer;
  let sequence: bigint[] = [];
  let visited = new Set<string>();
  for (let i = 0; i < 2000; ++i) {
    let next = evolve(last);
    sequence.push((next % 10n) - (last % 10n));
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
    counter.set(sKey, (counter.get(sKey) ?? 0n) + (last % 10n));
  }
}

export function partOne(input: string) {
  const buyers = lines(input).map(line => BigInt(line));
  let result = 0n;

  for (let buyer of buyers) {
    for (let i = 0; i < 2000; ++i) {
      buyer = evolve(buyer);
    }
    result += buyer;
  }

  return result;
}

export function partTwo(input: string) {
  const buyers = lines(input).map(line => BigInt(line));
  const mapping = new Map<string, bigint>();
  for (let buyer of buyers) {
    addSequences(mapping, buyer);
  }
  let maxBananas = 0n;
  for (let bananas of mapping.values()) {
    if (bananas > maxBananas) {
      maxBananas = bananas;
    }
  }
  return maxBananas;
}
