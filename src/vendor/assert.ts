import isEqual from "lodash/isEqual";

interface Assert {
  <T>(value: T, message?: string): asserts value;
  equal<T, U>(a: T, b: U, message?: string): void;
  throws(f: () => any, message?: string): void;
  deepEqual(a: unknown, b: unknown): void;
  deepStrictEqual(a: unknown, b: unknown): void;
}

function createAssert(): Assert {
  try {
    return eval(`require("assert")`);
  } catch (error) {
    // browser
    function assert<T>(condition: T, message?: string) {
      if (!condition) {
        throw new TypeError("Assertion failed: " + (message ?? ""));
      }
    }

    Object.defineProperty(assert, "equal", {
      value(a: any, b: any, message?: string) {
        return assert(a === b, message);
      },
    });

    Object.defineProperty(assert, "throws", {
      value(f: () => any, message?: string) {
        try {
          f();
        } catch (error) {
          return;
        }
        throw new TypeError("Assertion failed (throw): " + (message ?? ""));
      },
    });

    Object.defineProperty(assert, "deepEqual", {
      value(a: any, b: any, message?: string) {
        assert(isEqual(a, b), message);
      },
    });

    Object.defineProperty(assert, "deepStrictEqual", {
      get() {
        return this.deepEqual;
      },
    });

    return assert as unknown as any;
  }
}

const assert: Assert = createAssert();

export default assert;
