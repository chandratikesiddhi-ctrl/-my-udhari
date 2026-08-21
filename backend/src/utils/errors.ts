import { ERROR_CODES } from '../constants';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly errors?: Array<{ field?: string; message: string }>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errorCode: string = ERROR_CODES.INTERNAL_SERVER_ERROR,
    errors?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Array<{ field?: string; message: string }>) {
    return new AppError(message, 400, ERROR_CODES.BAD_REQUEST, errors);
  }

  static validation(message: string, errors?: Array<{ field?: string; message: string }>) {
    return new AppError(message, 400, ERROR_CODES.VALIDATION_ERROR, errors);
  }

  static unauthorized(message = 'Unauthorized access. Please provide valid credentials.') {
    return new AppError(message, 401, ERROR_CODES.UNAUTHORIZED);
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new AppError(message, 403, ERROR_CODES.FORBIDDEN);
  }

  static notFound(message = 'Requested resource not found.') {
    return new AppError(message, 404, ERROR_CODES.NOT_FOUND);
  }

  static duplicatePhone(message = 'A customer with this phone number already exists.') {
    return new AppError(message, 400, ERROR_CODES.DUPLICATE_PHONE);
  }

  static rateLimit(message = 'Too many requests. Please try again later.') {
    return new AppError(message, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}
