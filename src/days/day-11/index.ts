function parse(input: string) {
  const stones = input
    .split(/\s+/g)
    .map((i) => i.trim())
    .filter((i) => i.length > 0)
    .map((i) => BigInt(i));

  const result = new Map<bigint, number>();
  for (const stone of stones) {
    result.set(stone, (result.get(stone) ?? 0) + 1);
  }
  return result;
}

function add(stones: Map<bigint, number>, stone: bigint, count: number) {
  stones.set(stone, (stones.get(stone) ?? 0) + count);
}

function tick(stones: Map<bigint, number>) {
  const next = new Map<bigint, number>();
  for (const [stone, count] of stones) {
    if (stone === 0n) {
      add(next, 1n, count);
      continue;
    }
    const asStr = stone.toString();
    if (asStr.length % 2 === 0) {
      const left = BigInt(asStr.substring(0, asStr.length / 2));
      const right = BigInt(asStr.substring(asStr.length / 2));
      add(next, left, count);
      add(next, right, count);
      continue;
    }
    add(next, stone * 2024n, count);
  }
  return next;
}

export function partOne(input: string) {
  let stones = parse(input);
  for (let i = 0; i < 25; ++i) {
    stones = tick(stones);
  }
  return [...stones].reduce((acc, [, count]) => acc + count, 0);
}

export function partTwo(input: string) {
  let stones = parse(input);
  for (let i = 0; i < 75; ++i) {
    stones = tick(stones);
  }
  return [...stones].reduce((acc, [, count]) => acc + count, 0);
}
