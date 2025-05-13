const Rating = require('../models/ratingModel');
const APIFeatures = require('../utils/apiFeatures');
const { addHATEOASLinks } = require('../utils/hateoas');
const AppError = require('../utils/appError');
const Movie = require('../models/movieModel');

exports.getAllRatings = async (req, res, next) => {
  try {
    const features = new APIFeatures(Rating.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    
    const ratings = await features.query.populate('movie', 'title');
    const total = await Rating.countDocuments(features.filterQuery);

    const ratingsWithLinks = ratings.map(rating => 
      addHATEOASLinks(rating.toObject(), req, 'rating')
    );

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const totalPages = Math.ceil(total / limit);

    const response = {
      status: 'success',
      results: ratings.length,
      data: ratingsWithLinks,
      links: {
        self: { href: req.originalUrl },
        first: { href: `${req.baseUrl}/ratings?page=1&limit=${limit}` },
        prev: page > 1 ? { href: `${req.baseUrl}/ratings?page=${page - 1}&limit=${limit}` } : null,
        next: page < totalPages ? { href: `${req.baseUrl}/ratings?page=${page + 1}&limit=${limit}` } : null,
        last: { href: `${req.baseUrl}/ratings?page=${totalPages}&limit=${limit}` }
      }
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

exports.createRating = async (req, res, next) => {
  try {
    const { movie, value, review } = req.body;

    // Validate required fields
    if (!movie || !value) {
      return next(new AppError('Please provide movie ID and rating value', 400));
    }

    // Validate rating value
    if (value < 1 || value > 10) {
      return next(new AppError('Rating value must be between 1 and 10', 400));
    }

    // Check if movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return next(new AppError('No movie found with that ID', 404));
    }

    // Create the rating
    const newRating = await Rating.create({
      movie,
      value,
      review: review || '',
      user: req.user._id
    });

    // Populate movie details in the response
    await newRating.populate('movie', 'title');

    const ratingWithLinks = addHATEOASLinks(newRating.toObject(), req, 'rating');

    res.status(201).json({
      status: 'success',
      data: {
        rating: ratingWithLinks
      }
    });
  } catch (err) {
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return next(new AppError(err.message, 400));
    }
    // Handle duplicate ratings (if you want to prevent multiple ratings per user)
    if (err.code === 11000) {
      return next(new AppError('You have already rated this movie', 400));
    }
    next(err);
  }
};
