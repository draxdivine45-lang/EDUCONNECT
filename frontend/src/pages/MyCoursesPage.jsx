import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyCourses, deleteCourse } from '../api/courses';
import { extractErrorMessage } from '../api/client';
import { Loading, ErrorState, EmptyState } from '../components/StatusStates';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const data = await listMyCourses();
      setCourses(data);
      setStatus('success');
    } catch (err) {
      setError(extractErrorMessage(err));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(courseId) {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    setDeletingId(courseId);
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page my-courses-page">
      <div className="page-header">
        <h1>My Courses</h1>
        <Link to="/my-courses/new" className="btn btn-primary">
          + New Course
        </Link>
      </div>

      {status === 'loading' && <Loading label="Loading your courses..." />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}

      {status === 'success' && courses.length === 0 && (
        <EmptyState
          message="You haven't created any courses yet."
          action={
            <Link to="/my-courses/new" className="btn btn-primary">
              Create your first course
            </Link>
          }
        />
      )}

      {status === 'success' && courses.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.category}</td>
                <td>${course.price.toFixed(2)}</td>
                <td>{course.reviewCount > 0 ? `★ ${course.averageRating.toFixed(1)}` : '—'}</td>
                <td className="table-actions">
                  <Link to={`/courses/${course._id}`}>View</Link>
                  <Link to={`/my-courses/${course._id}/edit`}>Edit</Link>
                  <button
                    type="button"
                    className="btn btn-link btn-danger"
                    onClick={() => handleDelete(course._id)}
                    disabled={deletingId === course._id}
                  >
                    {deletingId === course._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
