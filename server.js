require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const errorHandler = require('./src/middleware/error');
const movieRoutes = require('./src/routes/movieRoutes');
const actorRoutes = require('./src/routes/actorRoutes');
const ratingRoutes = require('./src/routes/ratingRoutes');
const authRoutes = require('./src/routes/authRoutes');
const AppError = require('./src/utils/appError');

const app = express();

// Trust proxies (important for rate limiting behind reverse proxies)
app.set('trust proxy', true);

// Connect to MongoDB
require('./src/config/mongoose')();

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Movie API',
    endpoints: {
      movies: '/api/v1/movies',
      actors: '/api/v1/actors',
      ratings: '/api/v1/ratings',
      documentation: '/api-docs'
    }
  });
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie Database API',
      version: '1.0.0',
      description: 'A RESTful API for managing movie information'
    },
    servers: [
      {
        url: 'https://apiassignment1dv027-production.up.railway.app'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Middleware stack
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Logging
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/actors', actorRoutes);
app.use('/api/v1/ratings', ratingRoutes);

// Handle 404 - must be after all other routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware - must be after all other middleware/routes
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

module.exports = app;
