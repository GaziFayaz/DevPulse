import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, StatusCodes.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation error") {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
