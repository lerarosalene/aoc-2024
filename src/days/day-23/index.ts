import assert from "../../vendor/assert";
import { lines } from "../../common/utils";
import { intersection, subtract, take, union } from "../../common/set-utils";

function parse(input: string) {
  return lines(input).map((line) => {
    const [left, right] = line.split("-");
    return [left, right] as [string, string];
  });
}

function tripletKey(triplet: string[]) {
  assert.equal(triplet.length, 3);
  return [...triplet].sort().join(":");
}

class Graph {
  private _nodes = new Map<string, Set<string>>();

  public add(left: string, right: string) {
    let lBucket = this._nodes.get(left);
    if (!lBucket) {
      lBucket = new Set();
      this._nodes.set(left, lBucket);
    }
    lBucket.add(right);
    let rBucket = this._nodes.get(right);
    if (!rBucket) {
      rBucket = new Set();
      this._nodes.set(right, rBucket);
    }
    rBucket.add(left);
  }

  public isConnected(a: string, b: string) {
    return this._nodes.get(a)?.has(b) ?? false;
  }

  public connections(node: string) {
    return this._nodes.get(node) ?? new Set();
  }

  public nodes() {
    return this._nodes.keys();
  }

  public *cliques() {
    yield* this._bronKerbosch(new Set(), new Set(this.nodes()), new Set());
  }

  private *_bronKerbosch(
    r: Set<string>,
    p: Set<string>,
    x: Set<string>,
  ): IterableIterator<Set<string>> {
    if (p.size === 0 && x.size === 0) {
      yield r;
      return;
    }

    const u = take(p) ?? take(x);
    assert(u);
    for (const v of subtract(p, this.connections(u))) {
      yield* this._bronKerbosch(
        union(r, new Set([v])),
        intersection(p, this.connections(v)),
        intersection(x, this.connections(v)),
      );
      p = subtract(p, new Set([v]));
      x = union(x, new Set([v]));
    }
  }
}

export function partOne(input: string) {
  const connections = parse(input);
  const graph = new Graph();
  const triplets = new Map<string, string[]>();

  for (const [left, right] of connections) {
    graph.add(left, right);
  }

  for (const a of graph.nodes()) {
    const connections = [...graph.connections(a)];
    for (let i = 0; i < connections.length; ++i) {
      for (let j = i + 1; j < connections.length; ++j) {
        const b = connections[i];
        const c = connections[j];
        if (graph.isConnected(b, c)) {
          const tKey = tripletKey([a, b, c]);
          triplets.set(tKey, [a, b, c]);
        }
      }
    }
  }

  return [...triplets.values()].filter((triplet) =>
    triplet.some((node) => node.startsWith("t")),
  ).length;
}

export function partTwo(input: string) {
  const connections = parse(input);
  const graph = new Graph();

  for (const [left, right] of connections) {
    graph.add(left, right);
  }

  let biggest = new Set<string>();

  for (const clique of graph.cliques()) {
    if (clique.size > biggest.size) {
      biggest = clique;
    }
  }

  return [...biggest].sort().join(",");
}
