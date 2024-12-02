export class SkipArray<T> {
  private data: T[];
  private skip: number;

  constructor(data: T[], skip: number) {
    this.data = data;
    this.skip = skip;
  }

  public get length() {
    const skips = this.skip >= 0 && this.skip < this.data.length;
    return skips ? this.data.length - 1 : this.data.length;
  }

  public at(index: number) {
    if (this.skip === -1) {
      return this.data[index];
    }
    if (index < this.skip) {
      return this.data[index];
    }
    if (index >= this.skip) {
      return this.data[index + 1];
    }
    throw new TypeError("index is not a valid integer");
  }
}
