const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');

async function recalculateCourseRating(courseId) {
  const stats = await Review.aggregate([
    { $match: { course: courseId } },
    { $group: { _id: '$course', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Course.findByIdAndUpdate(courseId, {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
}

async function addOrUpdateReview(studentId, courseId, { rating, comment }) {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  const enrolled = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrolled) {
    throw ApiError.forbidden('You must be enrolled in this course to leave a review');
  }

  const review = await Review.findOneAndUpdate(
    { course: courseId, student: studentId },
    { rating, comment },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  await recalculateCourseRating(course._id);
  return review;
}

async function listCourseReviews(courseId) {
  return Review.find({ course: courseId })
    .populate('student', 'username name profilePictureUrl')
    .sort({ createdAt: -1 });
}

async function deleteReview(reviewId, studentId) {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound('Review not found');

  if (review.student.toString() !== studentId.toString()) {
    throw ApiError.forbidden('You do not have permission to delete this review');
  }

  const courseId = review.course;
  await review.deleteOne();
  await recalculateCourseRating(courseId);
}

module.exports = { addOrUpdateReview, listCourseReviews, deleteReview };
