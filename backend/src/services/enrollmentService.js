const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');

async function enroll(studentId, courseId) {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  if (course.instructor.toString() === studentId.toString()) {
    throw ApiError.badRequest('Instructors cannot enroll in their own course');
  }

  const existing = await Enrollment.findOne({ student: studentId, course: courseId });
  if (existing) {
    throw ApiError.conflict('You are already enrolled in this course');
  }

  return Enrollment.create({ student: studentId, course: courseId });
}

async function listMyEnrollments(studentId) {
  return Enrollment.find({ student: studentId })
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'username name' },
    })
    .sort({ createdAt: -1 });
}

async function isEnrolled(studentId, courseId) {
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  return Boolean(enrollment);
}

module.exports = { enroll, listMyEnrollments, isEnrolled };
