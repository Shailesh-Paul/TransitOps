import { AppError, ValidationError, ConflictError, DatabaseError, AuthenticationError } from "../core/errors.js";
import { errorLogger } from "../utils/logger.js";

const handleJoiError = (err) => {
  const errorMessage = err.details.map((detail) => detail.message).join(", ");
  const errors = err.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message,
  }));
  return new ValidationError(`Validation Error: ${errorMessage}`, { details: errors });
};

const handleDuplicateFieldsDB = (err) => {
  // MySQL error code for duplicate entry is ER_DUP_ENTRY
  const valueMatch = err.sqlMessage.match(/(["'])(\\?.)*?\1/);
  const value = valueMatch ? valueMatch[0] : "value";
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ConflictError(message, { value });
};

const handleForeignKeyErrorDB = () => {
  return new DatabaseError("Referenced record does not exist or cannot be deleted.", 400);
};

const handleJWTError = () =>
  new AuthenticationError("Invalid token. Please log in again!");

const handleJWTExpiredError = () =>
  new AuthenticationError("Your token has expired! Please log in again.");

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errorCode: err.errorCode,
    metadata: err.metadata,
    errors: err.errors || [err],
    timestamp: new Date().toISOString(),
    requestId: req.id,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      metadata: err.metadata,
      errors: err.errors || [],
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // 1) Log error
    errorLogger.error(`[UNHANDLED ERROR]: ${err.message}`, { stack: err.stack, fullError: err, requestId: req.id });

    // 2) Send generic message
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errorCode: "ERR_INTERNAL",
      errors: [],
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }
};

export const globalErrorHandler = (err, req, res, next) => {
  // Create a base copy of the error to mutate for mapping
  let error = Object.assign(err);
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;
  error.isJoi = err.isJoi;
  error.statusCode = err.statusCode || 500;
  
  // Catch Validation Errors (Joi)
  if (error.isJoi) error = handleJoiError(error);
  
  // Catch MySQL Errors
  if (error.code === "ER_DUP_ENTRY") error = handleDuplicateFieldsDB(error);
  if (error.code === "ER_NO_REFERENCED_ROW_2" || error.code === "ER_ROW_IS_REFERENCED_2") 
    error = handleForeignKeyErrorDB();

  // Catch JWT Errors
  if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  // Re-assign status code after mapping
  error.statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};
