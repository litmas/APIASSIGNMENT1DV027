class AppError extends Error {
  /**
   * Constructor for creating a custom error object.
   *
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code of the error.
   *
   * @return {void}
   */
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
