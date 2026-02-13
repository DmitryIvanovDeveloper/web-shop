// Global type definitions for testing framework
declare global {
  const describe: typeof import('vitest')['describe'];
  const it: typeof import('vitest')['it'];
  const test: typeof import('vitest')['test'];
  const expect: typeof import('vitest')['expect'];
  const vi: typeof import('vitest')['vi'];
  const beforeEach: typeof import('vitest')['beforeEach'];
  const afterEach: typeof import('vitest')['afterEach'];
  const beforeAll: typeof import('vitest')['beforeAll'];
  const afterAll: typeof import('vitest')['afterAll'];

  namespace Vi {
    interface MockedFunction<T extends (...args: any[]) => any> {
      (...args: Parameters<T>): ReturnType<T>;
      mockImplementation: (fn: T) => Vi.MockedFunction<T>;
      mockReturnValue: (value: ReturnType<T>) => Vi.MockedFunction<T>;
      mockResolvedValue: (value: Awaited<ReturnType<T>>) => Vi.MockedFunction<T>;
      mockRejectedValue: (value: any) => Vi.MockedFunction<T>;
      mockClear: () => void;
      mockReset: () => void;
      mockRestore: () => void;
    }
  }
}

export {};