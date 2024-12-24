import { WorkerApi } from "../../vendor/worker-api";
import { WorkerData, isInfiniteLoop, placeObstacle } from "./common";
import { ContinousGrid } from "../../common/continous-grid";

function main(wd: WorkerData) {
  WorkerApi.off("message", main);
  const grid = ContinousGrid.parseCharGrid(wd.input);

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

  WorkerApi.send(result);
}

WorkerApi.on("message", main);
