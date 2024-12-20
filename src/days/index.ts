import * as Day1 from "./day-1";
import * as Day2 from "./day-2";
import * as Day3 from "./day-3";
import * as Day4 from "./day-4";
import * as Day5 from "./day-5";
import * as Day6 from "./day-6";
import * as Day7 from "./day-7";
import * as Day8 from "./day-8";
import * as Day9 from "./day-9";
import * as Day10 from "./day-10";
import * as Day11 from "./day-11";
import * as Day12 from "./day-12";
import * as Day13 from "./day-13";
import * as Day14 from "./day-14";
import * as Day15 from "./day-15";
import * as Day16 from "./day-16";
import * as Day17 from "./day-17";
import * as Day18 from "./day-18";
import * as Day19 from "./day-19";
import * as Day20 from "./day-20";

type SolverResolvedResult = number | bigint | string;
type SolverResult = SolverResolvedResult | Promise<SolverResolvedResult>;

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
days.set(8, Day8);
days.set(9, Day9);
days.set(10, Day10);
days.set(11, Day11);
days.set(12, Day12);
days.set(13, Day13);
days.set(14, Day14);
days.set(15, Day15);
days.set(16, Day16);
days.set(17, Day17);
days.set(18, Day18);
days.set(19, Day19);
days.set(20, Day20);
