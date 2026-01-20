

export class Result<T, E extends Error = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _data?: T,
    private readonly _error?: E
  ) {}

  static success<T, E extends Error = Error>(data: T): Result<T, E> {
    return new Result<T, E>(true, data, undefined);
  }

  static fail<T, E extends Error = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get data(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get data from a failed result');
    }
    return this._data!;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a successful result');
    }
    return this._error!;
  }

  map<U>(fn: (data: T) => U): Result<U, E> {
    if (this.isSuccess) {
      return Result.success(fn(this.data));
    }
    return Result.fail(this.error);
  }

  flatMap<U>(fn: (data: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess) {
      return fn(this.data);
    }
    return Result.fail(this.error);
  }
}

