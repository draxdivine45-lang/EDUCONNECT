const asyncHandler = require('../utils/asyncHandler');
const enrollmentService = require('../services/enrollmentService');

const enroll = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.enroll(req.user._id, req.params.id);
  res.status(201).json({ success: true, data: enrollment });
});

const listMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.listMyEnrollments(req.user._id);
  res.status(200).json({ success: true, data: enrollments });
});

module.exports = { enroll, listMyEnrollments };
