import { describe, it } from "node:test";
import { PriorityQueue } from "./priority-queue";
import assert from "node:assert";

describe("Priority Queue", () => {
  it("works correctly", () => {
    const pq = new PriorityQueue<number>((a, b) => a > b);
    pq.push(5);
    pq.push(1);
    pq.push(9);

    assert.deepEqual([9, 5, 1], [pq.pop(), pq.pop(), pq.pop()]);

    const reverse = new PriorityQueue<number>((a, b) => a < b);
    reverse.push(5);
    reverse.push(1);
    reverse.push(9);

    assert.deepEqual([1, 5, 9], [reverse.pop(), reverse.pop(), reverse.pop()]);
  });
});
