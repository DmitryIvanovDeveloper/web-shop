export abstract class Result<T, E> {
  abstract get isSuccess(): boolean;
  abstract get isFailure(): boolean;
  abstract get value(): T | undefined;
  abstract get error(): E | undefined;

  static ok<T, E = Error>(value: T): Success<T, E> {
    return new Success(value);
  }

  static fail<T = void, E = Error>(error: E): Failure<T, E> {
    return new Failure(error);
  }

  static error<T = void, E = Error>(error: E): Failure<T, E> {
    return Result.fail(error);
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isSuccess) {
      return Result.ok(fn(this.value!));
    }
    return Result.fail(this.error!);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess) {
      return fn(this.value!);
    }
    return Result.fail(this.error!);
  }

  onSuccess(fn: (value: T) => void): Result<T, E> {
    if (this.isSuccess) {
      fn(this.value!);
    }
    return this;
  }

  onFailure(fn: (error: E) => void): Result<T, E> {
    if (this.isFailure) {
      fn(this.error!);
    }
    return this;
  }
}

export class Success<T, E> extends Result<T, E> {
  constructor(private readonly _value: T) {
    super();
  }

  get isSuccess(): boolean {
    return true;
  }

  get isFailure(): boolean {
    return false;
  }

  get value(): T {
    return this._value;
  }

  get error(): E | undefined {
    return undefined;
  }
}

export class Failure<T, E> extends Result<T, E> {
  constructor(private readonly _error: E) {
    super();
  }

  get isSuccess(): boolean {
    return false;
  }

  get isFailure(): boolean {
    return true;
  }

  get value(): T | undefined {
    return undefined;
  }

  get error(): E {
    return this._error;
  }
}
