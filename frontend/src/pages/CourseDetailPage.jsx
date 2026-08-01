import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCourse,
  listCourseReviews,
  enrollInCourse,
  submitReview,
  deleteReview,
  listMyEnrollments,
} from '../api/courses';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Loading, ErrorState } from '../components/StatusStates';
import ReviewList from '../components/ReviewList';
import StarRatingInput from '../components/StarRatingInput';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const [courseData, reviewsData] = await Promise.all([getCourse(id), listCourseReviews(id)]);
      setCourse(courseData);
      setReviews(reviewsData);

      if (isAuthenticated) {
        const enrollments = await listMyEnrollments();
        setIsEnrolled(enrollments.some((e) => e.course?._id === id));
      }
      setStatus('success');
    } catch (err) {
      setError(extractErrorMessage(err));
      setStatus('error');
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleEnroll() {
    setEnrolling(true);
    setEnrollError('');
    try {
      await enrollInCourse(id);
      setIsEnrolled(true);
    } catch (err) {
      setEnrollError(extractErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);
    try {
      await submitReview(id, { rating: ratingInput, comment: commentInput });
      const updatedReviews = await listCourseReviews(id);
      setReviews(updatedReviews);
      const updatedCourse = await getCourse(id);
      setCourse(updatedCourse);
      setCommentInput('');
    } catch (err) {
      setReviewError(extractErrorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      await deleteReview(reviewId);
      const [updatedReviews, updatedCourse] = await Promise.all([listCourseReviews(id), getCourse(id)]);
      setReviews(updatedReviews);
      setCourse(updatedCourse);
    } catch (err) {
      setReviewError(extractErrorMessage(err));
    }
  }

  if (status === 'loading') return <Loading label="Loading course..." />;
  if (status === 'error') return <ErrorState message={error} onRetry={loadData} />;

  const isOwner = user && course.instructor?._id === user._id;

  return (
    <div className="page course-detail-page">
      <button type="button" className="btn btn-link" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <div className="course-detail-header">
        <span className="badge">{course.category}</span>
        <h1>{course.title}</h1>
        <p className="instructor">
          by {course.instructor?.name || course.instructor?.username}
        </p>
        <p className="rating">
          {course.reviewCount > 0
            ? `★ ${course.averageRating.toFixed(1)} (${course.reviewCount} reviews)`
            : 'No reviews yet'}
        </p>
        <p className="price">${course.price.toFixed(2)}</p>
      </div>

      <p className="course-description">{course.description}</p>

      {course.modules?.length > 0 && (
        <div className="modules-section">
          <h2>Modules</h2>
          <ol>
            {course.modules.map((mod) => (
              <li key={mod._id}>
                <strong>{mod.title}</strong>
                {mod.description && <p>{mod.description}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {isAuthenticated && !isOwner && (
        <div className="enroll-section">
          {isEnrolled ? (
            <p className="enrolled-badge">You are enrolled in this course.</p>
          ) : (
            <>
              <button type="button" className="btn btn-primary" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Enrolling...' : 'Enroll now'}
              </button>
              {enrollError && <p className="form-error">{enrollError}</p>}
            </>
          )}
        </div>
      )}

      {!isAuthenticated && <p>Log in to enroll in this course.</p>}

      <div className="reviews-section">
        <h2>Reviews</h2>
        <ReviewList reviews={reviews} currentUserId={user?._id} onDelete={handleDeleteReview} />

        {isEnrolled && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h3>Leave a review</h3>
            {reviewError && <p className="form-error">{reviewError}</p>}
            <StarRatingInput value={ratingInput} onChange={setRatingInput} />
            <textarea
              placeholder="Share your thoughts about this course..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              maxLength={2000}
            />
            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
