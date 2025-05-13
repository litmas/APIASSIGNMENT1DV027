const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Rating management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         movie:
 *           type: string
 *         value:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         review:
 *           type: string
 *         user:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - movie
 *         - value
 *         - user
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
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort by field (prefix with - for descending)
 *       - in: query
 *         name: movie
 *         schema:
 *           type: string
 *         description: Filter by movie ID
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
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
 *                 links:
 *                   type: object
 *                   properties:
 *                     self:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                     first:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                     prev:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                     next:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 *                     last:
 *                       type: object
 *                       properties:
 *                         href:
 *                           type: string
 */

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
 *             required:
 *               - movie
 *               - value
 *     responses:
 *       201:
 *         description: Rating created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     rating:
 *                       $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Bad request (missing fields or invalid data)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: Movie not found
 */

// GET all ratings
router.get('/', ratingController.getAllRatings);

// POST new rating (protected route)
router.post(
  '/',
  authController.protect, // Requires valid JWT token
  ratingController.createRating
);

module.exports = router;
