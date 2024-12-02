import * as Day1 from "./day-1";
import * as Day2 from "./day-2";

interface Solver {
  partOne(input: string): any;
  partTwo(input: string): any;
}

export const days = new Map<number, Solver>();

days.set(1, Day1);
days.set(2, Day2);
