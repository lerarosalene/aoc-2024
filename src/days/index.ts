import * as Day1 from "./day-1";
import * as Day2 from "./day-2";
import * as Day3 from "./day-3";
import * as Day4 from "./day-4";
import * as Day5 from "./day-5";
import * as Day6 from "./day-6";
import * as Day7 from "./day-7";

type SolverResult = number | string | Promise<number> | Promise<string>;

interface Solver {
  partOne(input: string): SolverResult;
  partTwo(input: string): SolverResult;
}

export const days = new Map<number, Solver>();

days.set(1, Day1);
days.set(2, Day2);
days.set(3, Day3);
days.set(4, Day4);
days.set(5, Day5);
days.set(6, Day6);
days.set(7, Day7);
