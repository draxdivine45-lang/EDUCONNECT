const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { requireFields, isNonEmptyString, isPositiveNumber } = require('../utils/validators');
const Course = require('../models/Course');
const courseService = require('../services/courseService');

const listCourses = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, page, limit } = req.query;

  const result = await courseService.listCourses({
    search: search || undefined,
    category: category || undefined,
    minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 12,
  });

  res.status(200).json({ success: true, data: result });
});

const getCategories = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: Course.CATEGORIES });
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  res.status(200).json({ success: true, data: course });
});

const listMyCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.listMyCourses(req.user._id);
  res.status(200).json({ success: true, data: courses });
});

function validateCoursePayload(body, { partial = false } = {}) {
  if (!partial) {
    requireFields(body, ['title', 'description', 'price', 'category']);
  }
  if (body.title !== undefined && !isNonEmptyString(body.title)) {
    throw ApiError.badRequest('Title must be a non-empty string');
  }
  if (body.description !== undefined && !isNonEmptyString(body.description)) {
    throw ApiError.badRequest('Description must be a non-empty string');
  }
  if (body.price !== undefined && !isPositiveNumber(body.price)) {
    throw ApiError.badRequest('Price must be a non-negative number');
  }
  if (body.category !== undefined && !Course.CATEGORIES.includes(body.category)) {
    throw ApiError.badRequest(`Category must be one of: ${Course.CATEGORIES.join(', ')}`);
  }
  if (body.modules !== undefined && !Array.isArray(body.modules)) {
    throw ApiError.badRequest('Modules must be an array');
  }
}

const createCourse = asyncHandler(async (req, res) => {
  validateCoursePayload(req.body);
  const course = await courseService.createCourse(req.user._id, req.body);
  res.status(201).json({ success: true, data: course });
});

const updateCourse = asyncHandler(async (req, res) => {
  validateCoursePayload(req.body, { partial: true });
  const course = await courseService.updateCourse(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, data: course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Course deleted' });
});

module.exports = {
  listCourses,
  getCategories,
  getCourse,
  listMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
