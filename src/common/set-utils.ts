export function union<T>(a: Set<T>, b: Set<T>) {
  let result = new Set<T>();
  for (const item of a) {
    result.add(item);
  }
  for (const item of b) {
    result.add(item);
  }
  return result;
}

export function intersection<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((item) => b.has(item)));
}

export function subtract<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((item) => !b.has(item)));
}

export function take<T>(set: Set<T>) {
  return set[Symbol.iterator]().next().value ?? null;
}
