const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields } = require('../utils/validators');
const reviewService = require('../services/reviewService');

const listCourseReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listCourseReviews(req.params.id);
  res.status(200).json({ success: true, data: reviews });
});

const addOrUpdateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  requireFields(req.body, ['rating']);

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw ApiError.badRequest('Rating must be an integer between 1 and 5');
  }

  const review = await reviewService.addOrUpdateReview(req.user._id, req.params.id, {
    rating: numericRating,
    comment: comment || '',
  });
  res.status(201).json({ success: true, data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.reviewId, req.user._id);
  res.status(200).json({ success: true, message: 'Review deleted' });
});

module.exports = { listCourseReviews, addOrUpdateReview, deleteReview };
