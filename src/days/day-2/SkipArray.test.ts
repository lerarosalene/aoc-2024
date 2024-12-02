import { describe, it } from "node:test";
import { SkipArray } from "./SkipArray";
import assert from "node:assert";

function collect<T>(arr: SkipArray<T>): T[] {
  const result: T[] = [];
  for (let i = 0; i < arr.length; ++i) {
    result.push(arr.at(i));
  }
  return result;
}

describe("SkipArray<T>", () => {
  it("correctly not skips", () => {
    const arr1 = new SkipArray([1, 2, 3, 4, 5], -1);
    assert.deepStrictEqual(collect(arr1), [1, 2, 3, 4, 5]);

    const arr2 = new SkipArray([1, 2, 3, 4, 5], 5);
    assert.deepStrictEqual(collect(arr2), [1, 2, 3, 4, 5]);
  });
  it("correctly skips", () => {
    assert.deepStrictEqual(
      collect(new SkipArray([1, 2, 3, 4, 5], 0)),
      [2, 3, 4, 5],
    );
    assert.deepStrictEqual(
      collect(new SkipArray([1, 2, 3, 4, 5], 1)),
      [1, 3, 4, 5],
    );
    assert.deepStrictEqual(
      collect(new SkipArray([1, 2, 3, 4, 5], 2)),
      [1, 2, 4, 5],
    );
    assert.deepStrictEqual(
      collect(new SkipArray([1, 2, 3, 4, 5], 3)),
      [1, 2, 3, 5],
    );
    assert.deepStrictEqual(
      collect(new SkipArray([1, 2, 3, 4, 5], 4)),
      [1, 2, 3, 4],
    );
  });
});
