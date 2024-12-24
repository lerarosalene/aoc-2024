interface WorkerType {
  send(message: any): void;
  on(event: "message", handler: (data: any) => void): void;
  off(event: "message", handler: (data: any) => void): void;
}

interface WorkerConstructor {
  new (code: string): WorkerType;
}

function createWorker(): WorkerConstructor {
  try {
    const { Worker: NativeWorker } = eval(`require("node:worker_threads");`);

    return class WorkerWrapper {
      private worker: any;

      constructor(code: string) {
        this.worker = new NativeWorker(code, { eval: true });
      }

      send(message: any) {
        this.worker.postMessage(message);
      }

      on(event: "message", handler: (data: any) => void) {
        this.worker.on(event, handler);
      }

      off(event: "message", handler: (data: any) => void) {
        this.worker.off(event, handler);
      }
    };
  } catch (error) {
    return class WorkerWrapper {
      private worker: Worker;
      private handlerMap = new Map<Function, Function>();

      constructor(code: string) {
        const blob = new Blob([code], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        this.worker = new Worker(url);
        setTimeout(() => URL.revokeObjectURL(url));
      }

      send(message: any) {
        this.worker.postMessage(message);
      }

      on(event: "message", handler: (data: any) => void) {
        if (event !== "message") {
          throw new Error(`Unknown event ${event}`);
        }
        const nativeHandler = (ev: MessageEvent) => {
          handler(ev.data);
        };
        this.worker.addEventListener("message", nativeHandler);
        this.handlerMap.set(handler, nativeHandler);
      }

      off(event: "message", handler: (data: any) => void) {
        if (event !== "message") {
          throw new Error(`Unknown event ${event}`);
        }
        const nativeHandler = this.handlerMap.get(handler);
        if (!nativeHandler) {
          return;
        }
        this.worker.removeEventListener(
          "message",
          nativeHandler as unknown as any,
        );
        this.handlerMap.delete(handler);
      }
    };
  }
}

const RealWorker = createWorker();
export { RealWorker as Worker };
