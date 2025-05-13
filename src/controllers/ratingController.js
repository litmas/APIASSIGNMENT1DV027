const Rating = require('../models/ratingModel');
const APIFeatures = require('../utils/apiFeatures');
const { addHATEOASLinks } = require('../utils/hateoas');

exports.getAllRatings = async (req, res, next) => {
  try {
    const features = new APIFeatures(Rating.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    
    const ratings = await features.query;
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

  exports.createRating = async (req, res, next) => {
  try {
    const { movie, value, review } = req.body;
    
    // Validate required fields
    if (!movie || !value) {
      return next(new AppError('Please provide movie and rating value', 400));
    }

    // Create the rating
    const newRating = await Rating.create({
      movie,
      value,
      review: review || '',
      user: req.user._id // Assuming you have user authentication
    });

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
    next(err);
  }
};
