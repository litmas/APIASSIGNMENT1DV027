const { verifyToken } = require('../config/jwt');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

/**
 * Protects a resource by checking if the user is authenticated
 *
 * @param {Function} middlewareFunction - The middleware function to check if the user is authenticated
 * @returns {Function} - A middleware function to protect the resource
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = verifyToken(token);

    /**
     * Retrieves the current user by decoding the provided ID.
     * @type {Object}
     */
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};
