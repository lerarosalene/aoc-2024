import { describe, it } from "node:test";
import { goNext } from "./common";
import assert from "node:assert";

describe("goNext iterator", () => {
  it("correctly enumerates all operator combinations (2)", () => {
    const result = [];
    const numbers = [0, 0, 0];
    do {
      result.push(numbers.join(""));
    } while (goNext(numbers, 1));
    assert.deepEqual(result, [
      "000",
      "001",
      "010",
      "011",
      "100",
      "101",
      "110",
      "111",
    ]);
  });
  it("correctly enumerates all operator combinations (3)", () => {
    const result = [];
    const numbers = [0, 0];
    do {
      result.push(numbers.join(""));
    } while (goNext(numbers, 2));
    assert.deepEqual(result, [
      "00",
      "01",
      "02",
      "10",
      "11",
      "12",
      "20",
      "21",
      "22",
    ]);
  });
});
