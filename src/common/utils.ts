export function lines(input: string) {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
