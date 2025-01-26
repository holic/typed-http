import { ArkError } from "arktype";

export function isArkError(error: unknown) {
  return (
    error instanceof ArkError ||
    (error instanceof AggregateError && error.errors.every(isArkError))
  );
}

// TODO: base error

export class RouteHandlerError extends Error {
  status: number;

  constructor({
    status,
    message,
    cause,
  }: {
    status: number;
    message: string;
    cause?: unknown;
  }) {
    super(`${message}\n\n${cause}`, { cause });
    this.status = status;
  }
}
