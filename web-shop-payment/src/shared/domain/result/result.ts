export abstract class Result<T, E> {
  abstract get success(): boolean;
  abstract get data(): T | undefined;
  abstract get error(): E | undefined;

  static ok<T, E>(data: T): Success<T, E> {
    return new Success(data);
  }

  static error<T, E>(error: E): Failure<T, E> {
    return new Failure(error);
  }

  isSuccess(): this is Success<T, E> {
    return this.success;
  }

  isFailure(): this is Failure<T, E> {
    return !this.success;
  }

  map<U>(fn: (data: T) => U): Result<U, E> {
    if (this.isSuccess()) {
      return Result.ok(fn(this.data!));
    }
    return Result.error(this.error!);
  }

  flatMap<U>(fn: (data: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess()) {
      return fn(this.data!);
    }
    return Result.error(this.error!);
  }

  onSuccess(fn: (data: T) => void): Result<T, E> {
    if (this.isSuccess()) {
      fn(this.data!);
    }
    return this;
  }

  onFailure(fn: (error: E) => void): Result<T, E> {
    if (this.isFailure()) {
      fn(this.error!);
    }
    return this;
  }
}

export class Success<T, E> extends Result<T, E> {
  constructor(private readonly _data: T) {
    super();
  }

  get success(): boolean {
    return true;
  }

  get data(): T {
    return this._data;
  }

  get error(): E | undefined {
    return undefined;
  }
}

export class Failure<T, E> extends Result<T, E> {
  constructor(private readonly _error: E) {
    super();
  }

  get success(): boolean {
    return false;
  }

  get data(): T | undefined {
    return undefined;
  }

  get error(): E {
    return this._error;
  }
}

