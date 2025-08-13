export class CustomError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}