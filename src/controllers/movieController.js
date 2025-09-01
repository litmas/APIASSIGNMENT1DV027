const Movie = require('../models/movieModel');
const Rating = require('../models/ratingModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { addHATEOASLinks } = require('../utils/hateoas');

/**
 * Retrieves all movies from the database.
 *
 * @return {Array} An array of all movies stored in the database.
 */
exports.getAllMovies = async (req, res, next) => {
  try {
    const features = new APIFeatures(Movie.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const movies = await features.query;
    const total = await Movie.countDocuments(features.filterQuery);

    const moviesWithLinks = movies.map((movie) => addHATEOASLinks(movie.toObject(), req, 'movie'));

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const totalPages = Math.ceil(total / limit);

    /**
     * Represents the response object returned from a request to fetch movies with pagination links.
     * @property {string} status - The status of the response, usually 'success'.
     * @property {number} results - The number of movies in the response.
     * @property {Array} data - An array of movies with additional links.
     * @property {Object} links - An object containing pagination links for navigating through the movie list.
     * @property {Object} links.self - The self link for the current page.
     * @property {string} links.self.href - The URL of the current page.
     * @property {Object} links.first - The first page link.
     * @property {string} links.first.href - The URL of the first page.
     * @property {Object | null} links.prev - The previous page link or null if on the first page.
     * @property {string} links.prev.href - The URL of the previous page.
     * @property {Object | null} links.next - The next page link or null if on the last page.
     * @property {string} links.next.href - The URL of the next page.
     * @property {Object} links.last - The last page link.
     * @property {string} links.last.href - The URL of the last page.
     */
    const response = {
      status: 'success',
      results: movies.length,
      movies: moviesWithLinks,
      links: {
        self: { href: req.originalUrl },
        first: { href: `${req.baseUrl}/movies?page=1&limit=${limit}` },
        prev: page > 1 ? { href: `${req.baseUrl}/movies?page=${page - 1}&limit=${limit}` } : null,
        next: page < totalPages ? { href: `${req.baseUrl}/movies?page=${page + 1}&limit=${limit}` } : null,
        last: { href: `${req.baseUrl}/movies?page=${totalPages}&limit=${limit}` },
      },
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves information about a movie from the database.
 *
 * @param {number} movieId - The unique identifier of the movie.
 * @returns {object} - An object containing details of the movie such as title, director, release year, and genre.
 */
exports.getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return next(new AppError('No movie found with that ID', 404));
    }

    const movieObj = movie.toObject();
    movieObj.id = movieObj._id;
    const movieWithLinks = addHATEOASLinks(movieObj, req, 'movie');

    res.status(200).json({
      status: 'success',
      movie: {
        movie: movieWithLinks,
      },
    });
  } catch (err) {
    next(err);
  }
};
/**
 * Creates a new movie object with the provided details.
 *
 * @param {string} title - The title of the movie.
 * @param {number} releaseYear - The release year of the movie.
 * @param {string[]} actors - An array of actors starring in the movie.
 * @param {string} director - The director of the movie.
 * @returns {Object} A movie object with the provided details.
 */
exports.createMovie = async (req, res, next) => {
  try {
    const newMovie = await Movie.create(req.body);

    const movieWithLinks = addHATEOASLinks(newMovie.toObject(), req, 'movie');

    res.status(201).json({
      status: 'success',
      movie: {
        movie: movieWithLinks,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates information for a specific movie in the database.
 *
 * @param {string} movieId - The ID of the movie to be updated.
 * @param {Object} updatedData - An object containing the updated information for the movie.
 * @returns {Promise} - A promise that resolves with the updated movie object if successful,
 *                      or rejects with an error if the update fails.
 */
exports.updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return next(new AppError('No movie found with that ID', 404));
    }

    const movieWithLinks = addHATEOASLinks(movie.toObject(), req, 'movie');

    res.status(200).json({
      status: 'success',
      movie: {
        movie: movieWithLinks,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Deletes a movie from the database.
 *
 * @param {string} movieId - The ID of the movie to be deleted.
 * @returns {Promise} A promise that resolves if the movie is successfully deleted, and rejects with an error otherwise.
 */
exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return next(new AppError('No movie found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Movie deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves the ratings of a movie from an external source.
 * This function makes an API call to fetch the ratings of the specified movie.
 * @param {string} movieTitle - The title of the movie to get ratings for.
 * @returns {Promise} A Promise that resolves with the ratings of the movie.
 */
exports.getMovieRatings = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return next(new AppError('No movie found with that ID', 404));
    }

    const ratings = await Rating.find({ movie: req.params.id });

    const ratingsWithLinks = ratings.map((rating) => addHATEOASLinks(rating.toObject(), req, 'rating'));

    res.status(200).json({
      status: 'success',
      results: ratings.length,
      ratings: {
        ratings: ratingsWithLinks,
      },
    });
  } catch (err) {
    next(err);
  }
};
