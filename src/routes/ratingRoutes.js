const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Rating information endpoints
 */

/**
 * @swagger
 * /api/v1/ratings:
 *   get:
 *     summary: Get all ratings
 *     tags: [Ratings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rating'
 */
router.get('/', ratingController.getAllRatings);

const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authController = require('../controllers/authController');

// ... existing GET route ...

/**
 * @swagger
 * /api/v1/ratings:
 *   post:
 *     summary: Create a new rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movie
 *               - value
 *             properties:
 *               movie:
 *                 type: string
 *                 description: ID of the movie being rated
 *               value:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Rating value (1-10)
 *               review:
 *                 type: string
 *                 description: Optional review text
 *     responses:
 *       201:
 *         description: Rating created successfully
 *       400:
 *         description: Bad request (missing fields or invalid data)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.post('/', 
  authController.protect, // Add authentication middleware
  ratingController.createRating
);

module.exports = router;

module.exports = router;
