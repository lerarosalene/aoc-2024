import { isMainThread, parentPort, workerData } from "worker_threads";
import { WorkerData, solve } from "./common";

function main() {
  if (isMainThread) {
    throw new Error("expected to be ran as worker");
  }

  const wd: WorkerData = workerData;
  const solvable = wd.input.filter((eq) => solve(eq, wd.lastOp));
  parentPort?.postMessage(solvable.reduce((acc, eq) => acc + eq.result, 0n));
}

main();
