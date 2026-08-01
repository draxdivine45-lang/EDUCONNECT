const express = require('express');
const courseController = require('../controllers/courseController');
const enrollmentController = require('../controllers/enrollmentController');
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Static/specific sub-paths must be declared before the generic /:id route.
router.get('/categories', courseController.getCategories);
router.get('/mine', requireAuth, courseController.listMyCourses);

router.get('/', courseController.listCourses);
router.post('/', requireAuth, courseController.createCourse);
router.get('/:id', courseController.getCourse);
router.put('/:id', requireAuth, courseController.updateCourse);
router.delete('/:id', requireAuth, courseController.deleteCourse);

router.post('/:id/enroll', requireAuth, enrollmentController.enroll);

router.get('/:id/reviews', reviewController.listCourseReviews);
router.post('/:id/reviews', requireAuth, reviewController.addOrUpdateReview);

module.exports = router;
