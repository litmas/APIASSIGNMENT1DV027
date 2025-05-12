const AppError = require('../utils/appError');

/**
 * Function to handle cast error from database operations.
 * @param {Object} err - The error object containing information about the error.
 * @returns {AppError} - An instance of AppError with a custom error message and status code.
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
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
  return new AppError(message, 400);
};

/**
 * Handles validation errors from the database.
 * @param {Error} err - The error object containing validation errors.
 * @returns {AppError} Returns an AppError instance with a custom message and status code.
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Function to handle JWT error by creating a new AppError instance with a message 'Invalid token. Please log in again!' and a status code of 401.
 * @returns {AppError} AppError instance with message 'Invalid token. Please log in again!' and status code 401
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

/**
 * Generates an error message for JWT expiration.
 * @returns {AppError} AppError instance with a 401 status code
 */
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

/**
 * Sends an error response to the client.
 *
 * @param {Error} err - The error object containing error information.
 * @param {Object} res - The response object used to send the error response.
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Function to handle sending error responses to the client in production environment.
 *
 * @param {object} err - The error object containing information about the error.
 * @param {object} res - The response object to send the error response.
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('error', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

/**
 * Exports the current module for use in other files
 */
module.exports = (err, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
      sendErrorProd(error, res);
  }
};
