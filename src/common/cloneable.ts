export const clone = Symbol("clone");

export interface Cloneable<T> {
  [clone](): T;
}

export function isCloneable<T>(a: T): a is T & Cloneable<T> {
  return Boolean((a as any)[clone]);
}
