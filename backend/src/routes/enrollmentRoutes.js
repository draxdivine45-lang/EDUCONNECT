const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', requireAuth, enrollmentController.listMyEnrollments);

module.exports = router;
