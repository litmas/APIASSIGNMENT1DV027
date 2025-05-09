const httpStatus = require('http-status-codes');
const AppError = require('../utils/appError');

/**
 * Function to handle cast error from database operations.
 * @param {Object} err - The error object containing information about the error.
 * @returns {AppError} - An instance of AppError with a custom error message and status code.
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, httpStatus.BAD_REQUEST);
};

/**
 * Handle duplicate fields error from MongoDB
 *
 * @param {Object} err - The error object containing information about the duplicate field error
 * @returns {AppError} - An instance of AppError with a custom message for the duplicate field error
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, httpStatus.BAD_REQUEST);
};

/**
 * Handles validation errors from the database.
 * @param {Error} err - The error object containing validation errors.
 * @returns {AppError} Returns an AppError instance with a custom message and status code.
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, httpStatus.BAD_REQUEST, { errors });
};

/**
 * Function to handle JWT error by creating a new AppError instance with a message 'Invalid token. Please log in again!' and a status code of 401.
 * @returns {AppError} AppError instance with message 'Invalid token. Please log in again!' and status code 401
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again!', httpStatus.UNAUTHORIZED);

/**
 * Generates an error message for JWT expiration.
 * @returns {AppError} AppError instance with a 401 status code
 */
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', httpStatus.UNAUTHORIZED);

/**
 * Sends an error response to the client.
 *
 * @param {Error} err - The error object containing error information.
 * @param {Object} res - The response object used to send the error response.
 */
const sendErrorResponse = (err, res) => {
  const response = {
    status: err.status,
    message: err.message,
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  };

  res.status(err.statusCode).json(response);
};

module.exports = (err, req, res) => {
  err.statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendErrorResponse(error, res);
};
