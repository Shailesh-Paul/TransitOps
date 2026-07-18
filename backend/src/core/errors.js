/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(message, statusCode, errorCode = null, metadata = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || `ERR_${statusCode}`;
    this.metadata = metadata;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Validation Error
 * Used when input data fails schema validation.
 */
export class ValidationError extends AppError {
  constructor(message, metadata = null) {
    super(message, 400, 'ERR_VALIDATION', metadata);
  }
}

/**
 * 401 - Authentication Error
 * Used when a user is not authenticated or their token is invalid/expired.
 */
export class AuthenticationError extends AppError {
  constructor(message = "Authentication required", metadata = null) {
    super(message, 401, 'ERR_UNAUTHENTICATED', metadata);
  }
}

/**
 * 403 - Authorization Error
 * Used when an authenticated user lacks required permissions.
 */
export class AuthorizationError extends AppError {
  constructor(message = "Permission denied", metadata = null) {
    super(message, 403, 'ERR_UNAUTHORIZED', metadata);
  }
}

/**
 * 404 - Not Found Error
 * Used when a requested resource does not exist.
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", metadata = null) {
    super(message, 404, 'ERR_NOT_FOUND', metadata);
  }
}

/**
 * 409 - Conflict Error
 * Used when a request conflicts with the current state of the server (e.g. duplicates).
 */
export class ConflictError extends AppError {
  constructor(message = "Resource conflict", metadata = null) {
    super(message, 409, 'ERR_CONFLICT', metadata);
  }
}

/**
 * 400 - Business Rule Error
 * Used when a request violates domain business logic.
 */
export class BusinessRuleError extends AppError {
  constructor(message, metadata = null) {
    super(message, 400, 'ERR_BUSINESS_RULE', metadata);
  }
}

/**
 * 500 - Database Error
 * Used when a database query explicitly fails (or mapped to 400 if it's a foreign key/constraint error).
 */
export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", statusCode = 500, metadata = null) {
    super(message, statusCode, 'ERR_DATABASE', metadata);
  }
}

/**
 * 500 - Internal Server Error
 * Used for completely unhandled server issues.
 */
export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", metadata = null) {
    super(message, 500, 'ERR_INTERNAL', metadata);
    this.isOperational = false;
  }
}
