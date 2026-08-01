import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyEnrollments } from '../api/courses';
import { extractErrorMessage } from '../api/client';
import { Loading, ErrorState, EmptyState } from '../components/StatusStates';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const data = await listMyEnrollments();
      setEnrollments(data);
      setStatus('success');
    } catch (err) {
      setError(extractErrorMessage(err));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page dashboard-page">
      <h1>Welcome back, {user?.name || user?.username}</h1>
      <h2>Enrolled Courses</h2>

      {status === 'loading' && <Loading label="Loading your enrollments..." />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}

      {status === 'success' && enrollments.length === 0 && (
        <EmptyState
          message="You haven't enrolled in any courses yet."
          action={
            <Link to="/" className="btn btn-primary">
              Browse the catalog
            </Link>
          }
        />
      )}

      {status === 'success' && enrollments.length > 0 && (
        <ul className="enrollment-list">
          {enrollments.map((enrollment) => (
            <li key={enrollment._id} className="enrollment-item">
              <Link to={`/courses/${enrollment.course._id}`}>{enrollment.course.title}</Link>
              <span className="badge">{enrollment.course.category}</span>
              <span>
                Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
