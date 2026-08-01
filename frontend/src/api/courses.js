import apiClient from './client';

export function getCategories() {
  return apiClient.get('/courses/categories').then((res) => res.data.data);
}

export function listCourses(params) {
  return apiClient.get('/courses', { params }).then((res) => res.data.data);
}

export function getCourse(id) {
  return apiClient.get(`/courses/${id}`).then((res) => res.data.data);
}

export function listMyCourses() {
  return apiClient.get('/courses/mine').then((res) => res.data.data);
}

export function createCourse(payload) {
  return apiClient.post('/courses', payload).then((res) => res.data.data);
}

export function updateCourse(id, payload) {
  return apiClient.put(`/courses/${id}`, payload).then((res) => res.data.data);
}

export function deleteCourse(id) {
  return apiClient.delete(`/courses/${id}`).then((res) => res.data);
}

export function enrollInCourse(id) {
  return apiClient.post(`/courses/${id}/enroll`).then((res) => res.data.data);
}

export function listCourseReviews(id) {
  return apiClient.get(`/courses/${id}/reviews`).then((res) => res.data.data);
}

export function submitReview(id, payload) {
  return apiClient.post(`/courses/${id}/reviews`, payload).then((res) => res.data.data);
}

export function deleteReview(reviewId) {
  return apiClient.delete(`/reviews/${reviewId}`).then((res) => res.data);
}

export function listMyEnrollments() {
  return apiClient.get('/enrollments/mine').then((res) => res.data.data);
}
