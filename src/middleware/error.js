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
  return new AppError(message, 400, { errors });
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
const sendErrorResponse = (err, res) => {
  // Check if response object is valid
  if (!res || typeof res.status !== 'function') {
	console.error('Invalid response object:', res);
	return;
  }

  const response = {
	status: err.status,
	message: err.message,
	...(err.details && { details: err.details }),
	...(process.env.NODE_ENV === 'development' && {
  	stack: err.stack,
  	error: err,
	}),
  };

  res.status(err.statusCode || 500).json(response);
};

module.exports = (err, req, res, next) => {  // Add the 'next' parameter
  // Set default values if they don't exist
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'Something went wrong';

  // Handle specific error types
  let error = { ...err, message: err.message };

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Check if response object is valid
  if (!res || typeof res.status !== 'function') {
    console.error('Invalid response object - cannot send error response');
    return;
  }

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
      ...(error.details && { details: error.details })
    });
  } 
  // Production error response
  else {
    // Operational, trusted error: send message to client
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        ...(error.details && { details: error.details })
      });
    } 
    // Programming or other unknown error: don't leak error details
    else {
      // 1) Log error
      console.error('ERROR 💥', error);
      
      // 2) Send generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  }
};


