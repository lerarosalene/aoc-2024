import { isMainThread, parentPort, workerData } from "node:worker_threads";
import { WorkerData, isInfiniteLoop, placeObstacle } from "./common";
import { Grid } from "../../common/grid";

function main() {
  if (isMainThread) {
    throw new Error("Supposed to only be ran as a worker");
  }

  const wd: WorkerData = workerData;
  const grid = new Grid(wd.input);

  let result = 0;

  for (const point of wd.batch) {
    if (grid.at(point.x, point.y) !== ".") {
      continue;
    }
    let newGrid = placeObstacle(grid, point.x, point.y);
    if (isInfiniteLoop(newGrid)) {
      result += 1;
    }
  }

  parentPort?.postMessage(result);
}

main();
