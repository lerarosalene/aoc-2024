import p from "node:path";
import { Worker } from "node:worker_threads";
import { Equation, WorkerData, parse } from "./common";

const WORKER_THREADS = 12;

async function workerSolve(input: Equation[], lastOp: number) {
  const batches: Equation[][] = Array(WORKER_THREADS)
    .fill(0)
    .map(() => []);

  for (let i = 0; i < input.length; ++i) {
    batches[i % WORKER_THREADS].push(input[i]);
  }

  const promises: Array<Promise<bigint>> = [];
  for (let i = 0; i < WORKER_THREADS; ++i) {
    const promise = new Promise<bigint>(resolve => {
      const wd: WorkerData = { input: batches[i], lastOp };
      const worker = new Worker(p.resolve(__dirname, "day7.worker.js"), {
        workerData: wd
      });
      worker.on("message", (result: bigint) => resolve(result));
    });
    promises.push(promise);
  }

  const result = await Promise.all(promises);
  return String(result.reduce((a, b) => a + b));
}

export async function partOne(input: string) {
  const equations = parse(input);
  return await workerSolve(equations, 1);
}

export async function partTwo(input: string) {
  const equations = parse(input);
  return await workerSolve(equations, 2);
}
