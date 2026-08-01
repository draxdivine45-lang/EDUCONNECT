const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');

async function listCourses({ search, category, minPrice, maxPrice, page = 1, limit = 12 }) {
  const filter = {};

  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'username name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

async function getCourseById(id) {
  const course = await Course.findById(id).populate('instructor', 'username name');
  if (!course) throw ApiError.notFound('Course not found');
  return course;
}

async function listMyCourses(instructorId) {
  return Course.find({ instructor: instructorId }).sort({ createdAt: -1 });
}

async function createCourse(instructorId, data) {
  const { title, description, price, category, modules } = data;
  return Course.create({
    title,
    description,
    price,
    category,
    modules: modules || [],
    instructor: instructorId,
  });
}

async function updateCourse(courseId, userId, updates) {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  if (course.instructor.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have permission to modify this course');
  }

  const allowed = ['title', 'description', 'price', 'category', 'modules'];
  for (const field of allowed) {
    if (updates[field] !== undefined) course[field] = updates[field];
  }

  await course.save();
  return course;
}

async function deleteCourse(courseId, userId) {
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  if (course.instructor.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have permission to delete this course');
  }

  await Promise.all([
    course.deleteOne(),
    Enrollment.deleteMany({ course: courseId }),
    Review.deleteMany({ course: courseId }),
  ]);
}

module.exports = {
  listCourses,
  getCourseById,
  listMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
