import data from "./db.json";

type Entry = [string, number];
type DB = Entry[];

const db = new Map(data as DB);

export function getSolution(combo: string, depth: number) {
  const key = `${combo}:${depth}`;
  return db.get(key);
}
