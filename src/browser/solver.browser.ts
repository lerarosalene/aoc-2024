import { Worker } from "../vendor/worker";
import { IPCRequest, IPCResponse } from "./interfaces";

class RequestID {
  private lastId = 0;
  public get() {
    return this.lastId;
  }
}

const requestId = new RequestID();

interface SolveResult {
  partOne: string;
  partTwo: string;
}

export async function solve(day: number, input: string) {
  return new Promise<SolveResult>((resolve, reject) => {
    const worker = new Worker(WORKERS.MAIN);
    const id = requestId.get();
    const request: IPCRequest = {
      type: "solve",
      day,
      id,
      input,
    };
    let dispose: Function[] = [];
    const handleMessage = (message: IPCResponse) => {
      if (message.type === "error" && message.id === id) {
        reject(new Error(message.message));
        dispose.forEach((f) => f());
      }
      if (message.type === "success" && message.id === id) {
        resolve({ partOne: message.partOne, partTwo: message.partTwo });
        dispose.forEach((f) => f());
      }
    };
    worker.on("message", handleMessage);
    dispose.push(() => worker.off("message", handleMessage));
    worker.send(request);
  });
}

Object.defineProperty(window, "solve", {
  value: solve,
});
