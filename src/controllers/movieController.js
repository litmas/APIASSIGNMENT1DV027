import { getMovies, getMovieDetails } from '../api/moviesAPI.js';
import { getMovieRatings } from '../api/ratingsAPI.js';
import { getCurrentToken } from '../app.js';
import { showError } from '../utils/helpers.js';

/**
 * Loads movies based on provided parameters.
 *
 * @param {number} [page=1] - The page number of movies to load.
 * @param {number} [limit=10] - The maximum number of movies per page.
 * @param {object} [filters={}] - Additional filters to apply when loading movies.
 *
 * @return {Promise<void>} - A promise that resolves after loading and rendering movies successfully, or rejects if an error occurs.
 */
export async function loadMovies(page = 1, limit = 10, filters = {}) {
  try {
    const data = await getMovies(page, limit, filters);
    renderMovies(data, page, limit, filters);
  } catch (error) {
    showError('Failed to load movies. Please try again.');
  }
}

/**
 * Renders movies based on the provided data, pagination settings, and filters.
 *
 * @param {Object} data - The movie data to be rendered.
 * @param {number} page - The current page number.
 * @param {number} limit - The limit of movies per page.
 * @param {Object} filters - The filters to apply to the movies.
 *
 * @return {void}
 */
/**
 * Renders movies based on the provided data, pagination settings, and filters.
 *
 * @param {Object} data - The movie data to be rendered.
 * @param {number} page - The current page number.
 * @param {number} limit - The limit of movies per page.
 * @param {Object} filters - The filters to apply to the movies.
 *
 * @return {void}
 */
function renderMovies(data, page, limit, filters) {
  const mainContent = document.getElementById('main-content');
  let html = `
        <div class="row">
            <div class="col-12">
                <h2 class="mb-4">Movies</h2>
                <div class="filter-section mb-4">
                    <h5>Filters</h5>
                    <form id="movie-filters" class="row g-3">
                        <div class="col-md-3">
                            <label for="filter-title" class="form-label">Title</label>
                            <input type="text" class="form-control" id="filter-title" placeholder="Search by title" value="${filters.title || ''}">
                        </div>
                        <div class="col-md-3">
                            <label for="filter-genre" class="form-label">Genre</label>
                            <select class="form-select" id="filter-genre">
                                <option value="">All Genres</option>
                                <option value="Action" ${filters.genre === 'Action' ? 'selected' : ''}>Action</option>
                                <option value="Adventure" ${filters.genre === 'Adventure' ? 'selected' : ''}>Adventure</option>
                                <option value="Animation" ${filters.genre === 'Animation' ? 'selected' : ''}>Animation</option>
                                <option value="Comedy" ${filters.genre === 'Comedy' ? 'selected' : ''}>Comedy</option>
                                <option value="Crime" ${filters.genre === 'Crime' ? 'selected' : ''}>Crime</option>
                                <option value="Documentary" ${filters.genre === 'Documentary' ? 'selected' : ''}>Documentary</option>
                                <option value="Drama" ${filters.genre === 'Drama' ? 'selected' : ''}>Drama</option>
                                <option value="Fantasy" ${filters.genre === 'Fantasy' ? 'selected' : ''}>Fantasy</option>
                                <option value="Horror" ${filters.genre === 'Horror' ? 'selected' : ''}>Horror</option>
                                <option value="Mystery" ${filters.genre === 'Mystery' ? 'selected' : ''}>Mystery</option>
                                <option value="Romance" ${filters.genre === 'Romance' ? 'selected' : ''}>Romance</option>
                                <option value="Sci-Fi" ${filters.genre === 'Sci-Fi' ? 'selected' : ''}>Sci-Fi</option>
                                <option value="Thriller" ${filters.genre === 'Thriller' ? 'selected' : ''}>Thriller</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="filter-year-min" class="form-label">Year (Min)</label>
                            <input type="number" class="form-control" id="filter-year-min" placeholder="Min year" value="${filters.releaseYear?.gte || ''}">
                        </div>
                        <div class="col-md-3">
                            <label for="filter-year-max" class="form-label">Year (Max)</label>
                            <input type="number" class="form-control" id="filter-year-max" placeholder="Max year" value="${filters.releaseYear?.lte || ''}">
                        </div>
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary">Apply Filters</button>
                            <button type="button" id="reset-filters" class="btn btn-outline-secondary">Reset</button>
                        </div>
                    </form>
                </div>
    `;

  if (data.data.length === 0) {
    html += `
            <div class="col-12">
                <div class="alert alert-info">No movies found matching your criteria.</div>
            </div>
        `;
  } else {
    // Start the first row
    html += '<div class="row">';

    data.data.forEach((movie, index) => {
      html += `
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
              <span class="badge bg-primary genre-badge">${movie.genre}</span>
              <p class="card-text"><small class="text-muted">Released: ${movie.releaseYear}</small></p>
              <p class="card-text">${movie.description || 'No description available'}</p>
              <div class="mt-auto">
                <button class="btn btn-sm btn-outline-primary view-movie" data-id="${movie.id}">View Details</button>
                ${getCurrentToken() ? `<button class="btn btn-sm btn-outline-success ms-2 add-rating" data-id="${movie.id}">Add Rating</button>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;

      // Close and open new row every 3 movies
      if ((index + 1) % 3 === 0 && index !== data.data.length - 1) {
        html += '</div><div class="row">';
      }
    });

    // Close the last row
    html += '</div>';
  }

  html += '</div>';

  html += `
        <nav aria-label="Page navigation">
            <ul class="pagination">
                ${data.links.prev ? `<li class="page-item"><a class="page-link" href="#" data-page="${page - 1}">Previous</a></li>` : ''}
                ${Array.from({ length: data.links.last.href.split('page=')[1].split('&')[0] }, (_, i) => i + 1).map((p) => `
                    <li class="page-item ${p === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${p}">${p}</a></li>
                `).join('')}
                ${data.links.next ? `<li class="page-item"><a class="page-link" href="#" data-page="${page + 1}">Next</a></li>` : ''}
            </ul>
        </nav>
    `;

  mainContent.innerHTML = html;

  document.getElementById('movie-filters').addEventListener('submit', (e) => {
    e.preventDefault();
    const filters = {
      title: document.getElementById('filter-title').value,
      genre: document.getElementById('filter-genre').value,
      releaseYear: {},
    };

    const minYear = document.getElementById('filter-year-min').value;
    const maxYear = document.getElementById('filter-year-max').value;

    if (minYear) filters.releaseYear.gte = minYear;
    if (maxYear) filters.releaseYear.lte = maxYear;

    if (!filters.title) delete filters.title;
    if (!filters.genre) delete filters.genre;
    if (Object.keys(filters.releaseYear).length === 0) delete filters.releaseYear;

    loadMovies(1, limit, filters);
  });

  document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('movie-filters').reset();
    loadMovies(1, limit);
  });

  document.querySelectorAll('.page-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = parseInt(e.target.dataset.page);
      loadMovies(page, limit, filters);
    });
  });

  document.querySelectorAll('.view-movie').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const movieId = e.target.dataset.id;
      if (!movieId) {
        return;
      }
      viewMovieDetails(movieId);
    });
  });

  if (getCurrentToken()) {
    document.querySelectorAll('.add-rating').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const movieId = e.target.dataset.id;
        showAddRatingModal(movieId);
      });
    });
  }
}
/**
 * Fetches movie details and ratings for a given movie ID.
 *
 * @param {number} movieId - The unique identifier of the movie.
 *
 * @return {Promise} - A promise that resolves once the movie details and ratings are successfully fetched and rendered.
 */
export async function viewMovieDetails(movieId) {
  if (!movieId) {
    showError('Invalid movie selected');
    return;
  }

  try {
    const movie = await getMovieDetails(movieId);

    if (!movie || !movie.id) {
      throw new Error('Invalid movie data received from API');
    }

    const response = await getMovieRatings(movieId);
    let ratings = Array.isArray(response.data) ? response.data
      : (response.data?.ratings.ratings.ratings || []);

    if (!Array.isArray(ratings)) {
      ratings = [];
    }

    renderMovieDetails(movie, ratings);
  } catch (error) {
    showError('Failed to load movie details. Please try again.');
  }
}

/**
 * Renders the details of a movie along with its ratings.
 *
 * @param {Object} movie - The movie object containing title, genre, release year, and description.
 * @param {Array} ratings - An array of rating objects for the movie, each containing value, createdAt, and review.
 *
 * @return {void}
 */
function renderMovieDetails(movie, ratings) {
  const mainContent = document.getElementById('main-content');

  let html = `
        <div class="row">
            <div class="col-12">
                <button class="btn btn-sm btn-outline-secondary mb-3" id="back-to-movies">Back to Movies</button>
                
                ${getCurrentToken() ? `
                    <button class="btn btn-sm btn-outline-success add-rating mb-3 ms-2" data-id="${movie.id}">
                        Add Rating
                    </button>
                ` : ''}
                
                <div class="card mb-4">
                    <div class="card-body">
                        <h2 class="card-title">${movie.title}</h2>
                        <span class="badge bg-primary genre-badge">${movie.genre}</span>
                        <p class="card-text"><small class="text-muted">Released: ${movie.releaseYear}</small></p>
                        <p class="card-text">${movie.description || 'No description available'}</p>
                    </div>
                </div>
                
                <h4 class="mb-3">Ratings</h4>
    `;

  if (ratings.length === 0) {
    html += '<div class="alert alert-info">No ratings yet. Be the first to rate this movie!</div>';
  } else {
    // Calculate average rating
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, rating) => sum + rating.value, 0) / ratings.length) : 0;

    html += `
            <div class="d-flex align-items-center mb-4">
                <div class="rating-circle bg-success me-3">
                    ${avgRating.toFixed(1)}
                </div>
                <div>
                    <h5>Average Rating</h5>
                    <small>Based on ${ratings.length} ${ratings.length === 1 ? 'rating' : 'ratings'}</small>
                </div>
            </div>
            
            <div class="row">
        `;

    // Display individual ratings
    ratings.forEach((rating) => {
      html += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div class="rating-circle bg-primary">
                                    ${rating.value}
                                </div>
                                <small class="text-muted">${new Date(rating.createdAt).toLocaleDateString()}</small>
                            </div>
                            ${rating.review ? `<p class="card-text mt-2">${rating.review}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;
    });

    html += '</div>';
  }

  html += '</div></div>';

  mainContent.innerHTML = html;

  document.getElementById('back-to-movies').addEventListener('click', loadMovies);

  if (getCurrentToken()) {
    document.querySelector('.add-rating').addEventListener('click', (e) => {
      const movieId = e.target.dataset.id;
      showAddRatingModal(movieId);
    });
  }
}

/**
 * Displays a modal for adding a rating to a movie.
 *
 * @param {string} movieId - The unique identifier of the movie for which the rating is being added.
 *
 * @return {void}
 */
export function showAddRatingModal(movieId) {
  const modalHtml = `
        <div class="modal fade" id="ratingModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Rating</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="rating-form">
                            <input type="hidden" id="rating-movie-id" value="${movieId}">
                            <div class="mb-3">
                                <label for="rating-value" class="form-label">Rating (1-10)</label>
                                <input type="number" class="form-control" id="rating-value" min="1" max="10" required>
                            </div>
                            <div class="mb-3">
                                <label for="rating-review" class="form-label">Review (Optional)</label>
                                <textarea class="form-control" id="rating-review" rows="3"></textarea>
                            </div>
                            <div class="alert alert-danger d-none" id="rating-error"></div>
                            <button type="submit" class="btn btn-primary">Submit Rating</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const ratingModal = new bootstrap.Modal(document.getElementById('ratingModal'));
  ratingModal.show();

  document.getElementById('rating-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const ratingValue = parseInt(document.getElementById('rating-value').value);
    const review = document.getElementById('rating-review').value;

    try {
      await addRating(movieId, ratingValue, review);

      ratingModal.hide();
      document.getElementById('ratingModal').remove();

      viewMovieDetails(movieId);
    } catch (error) {
      document.getElementById('rating-error').textContent = error.message;
      document.getElementById('rating-error').classList.remove('d-none');
    }
  });

  document.getElementById('ratingModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('ratingModal').remove();
  });
}
