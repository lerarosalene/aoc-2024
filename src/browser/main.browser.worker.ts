import { days } from "../days";
import { WorkerApi } from "../vendor/worker-api";
import { IPCRequest, IPCResponse } from "./interfaces";

function send(response: IPCResponse) {
  WorkerApi.send(response);
}

WorkerApi.on("message", async (message: IPCRequest) => {
  switch (message.type) {
    case "solve": {
      try {
        const solver = days.get(message.day);
        if (!solver) {
          send({
            type: "error",
            id: message.id,
            message: `Solver for day ${message.day} not found`,
          });
          return;
        }
        const p1answer = await solver.partOne(message.input);
        const p2answer = await solver.partTwo(message.input);
        send({
          type: "success",
          id: message.id,
          partOne: String(p1answer),
          partTwo: String(p2answer),
        });
      } catch (error) {
        send({
          type: "error",
          id: message.id,
          message: error instanceof Error ? error.message : String(error),
        });
      }
      self.close();
      break;
    }
    default:
      throw new Error("Unreachable");
  }
});
