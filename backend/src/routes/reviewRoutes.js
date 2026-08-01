const express = require('express');
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.delete('/:reviewId', requireAuth, reviewController.deleteReview);

module.exports = router;
