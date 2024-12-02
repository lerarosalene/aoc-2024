function parse(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(/\s+/g))
    .map(([left, right]) => [Number(left.trim()), Number(right.trim())])
    .reduce(
      (acc, [left, right]) => {
        acc.left.push(left);
        acc.right.push(right);
        return acc;
      },
      { left: [] as number[], right: [] as number[] },
    );
}

export function partOne(input: string) {
  let { left, right } = parse(input);
  left = [...left].sort((a, b) => a - b);
  right = [...right].sort((a, b) => a - b);
  let total = 0;

  for (let i = 0; i < left.length; ++i) {
    total += Math.abs(left[i] - Math.abs(right[i]));
  }

  return total;
}

export function partTwo(input: string) {
  let { left, right } = parse(input);
  const rightMap = right.reduce((acc, value) => {
    acc.set(value, (acc.get(value) ?? 0) + 1);
    return acc;
  }, new Map<number, number>());

  return left.reduce(
    (acc, value) => acc + value * (rightMap.get(value) ?? 0),
    0,
  );
}
