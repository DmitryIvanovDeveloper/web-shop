export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  public readonly success = true;
  public readonly failure = false;

  constructor(public readonly data: T) {}

  public static ok<T>(data: T): Success<T> {
    return new Success(data);
  }

  public map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.data));
  }

  public flatMap<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.data);
  }
}

export class Failure<E> {
  public readonly success = false;
  public readonly failure = true;

  constructor(public readonly error: E) {}

  public static fail<E>(error: E): Failure<E> {
    return new Failure(error);
  }

  public map<U>(fn: (value: never) => U): Result<U, E> {
    return this as any;
  }

  public flatMap<U, F>(fn: (value: never) => Result<U, F>): Result<U, E> {
    return this as any;
  }
}

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success;
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.failure;
}
