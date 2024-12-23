import { PriorityQueue } from "./priority-queue";

interface BaseState {
  cost: number;
  key: string;
}

export function* dijkstra<T extends BaseState>(
  initial: T,
  neighbours: (state: T) => Iterable<T>,
  isTarget: (state: T) => boolean,
  pruneEqual: boolean = true,
) {
  const queue = new PriorityQueue<T>((a, b) => a.cost < b.cost);
  const distances = new Map<string, number>();
  queue.push(initial);

  let current: T | undefined;

  while ((current = queue.pop())) {
    const currentDistance = distances.get(current.key) ?? Infinity;
    if (currentDistance < current.cost) {
      continue;
    }
    if (pruneEqual && currentDistance === current.cost) {
      continue;
    }
    distances.set(current.key, current.cost);
    if (isTarget(current)) {
      yield current;
    }
    for (const neighbour of neighbours(current)) {
      queue.push(neighbour);
    }
  }
}
