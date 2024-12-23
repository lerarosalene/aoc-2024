export class PriorityQueue<T> {
  static parent = (i: number) => ((i + 1) >>> 1) - 1;
  static left = (i: number) => (i << 1) + 1;
  static right = (i: number) => (i + 1) << 1;

  constructor(private _compare: (a: T, b: T) => boolean) {}

  private _heap: T[] = [];

  public size() {
    return this._heap.length;
  }

  public isEmpty() {
    return this.size() == 0;
  }

  public peek(): T | undefined {
    return this._heap[0];
  }

  public push(...values: T[]) {
    for (const value of values) {
      this._heap.push(value);
      this._siftUp();
    }
    return this.size();
  }

  public pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > 0) {
      this._swap(0, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }

  public replace(value: T) {
    const replacedValue = this.peek();
    this._heap[0] = value;
    this._siftDown();
    return replacedValue;
  }

  private _greater(i: number, j: number) {
    return this._compare(this._heap[i], this._heap[j]);
  }

  private _swap(i: number, j: number) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }

  private _siftUp() {
    let node = this.size() - 1;
    while (node > 0 && this._greater(node, PriorityQueue.parent(node))) {
      this._swap(node, PriorityQueue.parent(node));
      node = PriorityQueue.parent(node);
    }
  }

  private _siftDown() {
    let node = 0;
    while (
      (PriorityQueue.left(node) < this.size() &&
        this._greater(PriorityQueue.left(node), node)) ||
      (PriorityQueue.right(node) < this.size() &&
        this._greater(PriorityQueue.right(node), node))
    ) {
      let maxChild =
        PriorityQueue.right(node) < this.size() &&
        this._greater(PriorityQueue.right(node), PriorityQueue.left(node))
          ? PriorityQueue.right(node)
          : PriorityQueue.left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}
