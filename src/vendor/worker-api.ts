interface WorkerApi {
  send(message: any): void;
  on(event: "message", handler: (data: any) => void): void;
  off(event: "message", handler: (data: any) => void): void;
}

function createWorkerApi(): WorkerApi {
  try {
    const { parentPort } = eval(`require("node:worker_threads");`);

    return {
      send(message: any) {
        parentPort.postMessage(message);
      },

      on(event: "message", handler: (data: any) => void) {
        parentPort.on(event, handler);
      },

      off(event: "message", handler: (data: any) => void) {
        parentPort.off(event, handler);
      },
    };
  } catch (error) {
    const api = {
      _handlers: new Map<Function, Function>(),

      send(message: any) {
        self.postMessage(message);
      },

      on(event: "message", handler: (data: any) => void) {
        if (event !== "message") {
          throw new Error(`Unknown event ${event}`);
        }
        const nativeHandler = (ev: MessageEvent) => {
          handler(ev.data);
        };
        self.addEventListener(event, nativeHandler);
        this._handlers.set(handler, nativeHandler);
      },

      off(event: "message", handler: (data: any) => void) {
        if (event !== "message") {
          throw new Error(`Unknown event ${event}`);
        }
        const nativeHandler = this._handlers.get(handler);
        if (!nativeHandler) {
          return;
        }
        self.removeEventListener(event, nativeHandler as unknown as any);
        this._handlers.delete(handler);
      },
    };

    return api as WorkerApi;
  }
}

export const WorkerApi = createWorkerApi();
