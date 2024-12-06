import { describe, it } from "node:test";
import { ContinousGrid } from "./continous-grid";
import assert from "node:assert";

// prettier-ignore
const GRID = [
  "..#.",
  "#..#",
  "...#"
].join("\n");

describe("Continous grid", () => {
  it("correctly parses input", () => {
    const grid = ContinousGrid.parseCharGrid(GRID);
    assert.equal(grid.at(0, 0), ".", "cell 0,0");
    assert.equal(grid.at(2, 0), "#", "cell 2,0");
    assert.equal(grid.at(3, 2), "#", "cell 3,2");
  });
  it("dimensions", () => {
    const grid = ContinousGrid.parseCharGrid(GRID);
    assert.equal(grid.width, 4);
    assert.equal(grid.height, 3);
  });
  it("out of bounds", () => {
    const grid = ContinousGrid.parseCharGrid(GRID);
    assert.equal(grid.at(-1, 0), null);
    assert.equal(grid.at(0, -1), null);
    assert.equal(grid.at(-1, -1), null);
    assert.equal(grid.at(grid.width + 1, 0), null);
    assert.equal(grid.at(0, grid.height + 1), null);
    assert.equal(grid.at(grid.width + 1, grid.height + 1), null);
  });
  it("mutation", () => {
    const grid = ContinousGrid.parseCharGrid(GRID);
    grid.set(0, 1, ".");
    assert.equal(grid.at(0, 1), ".");
    assert.throws(() => grid.set(grid.width + 1, 0, "."));
    assert.throws(() => grid.set(-1, 0, "."));
    assert.throws(() => grid.set(0, grid.height + 1, "."));
    assert.throws(() => grid.set(0, -1, "."));
  });
  it("mutation of clone doesn't affect original", () => {
    const grid = ContinousGrid.parseCharGrid(GRID);
    const clone = grid.clone();
    clone.set(0, 1, ".");
    assert.equal(clone.at(0, 1), ".");
    assert.equal(grid.at(0, 1), "#");
  });
});
