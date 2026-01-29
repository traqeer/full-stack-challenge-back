export type ErrorPrefix = 'auth_' | 'forbidden_' | 'not_found_' | 'invalid_' | 'conflict_';

export type ErrorCode = `${ErrorPrefix}${string}`;

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
