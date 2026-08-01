import { useEffect, useState } from 'react';
import { listCourses, getCategories } from '../api/courses';
import { extractErrorMessage } from '../api/client';
import CourseCard from '../components/CourseCard';
import SearchBar from '../components/SearchBar';
import { Loading, ErrorState, EmptyState } from '../components/StatusStates';

export default function CourseCatalogPage() {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ page: 1, limit: 9 });
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats);
      })
      .catch(() => {
        // Category filter is a non-critical enhancement; ignore failures silently.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError('');

    listCourses(filters)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setStatus('success');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractErrorMessage(err));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  function handleFilterChange(nextFilters) {
    setFilters(nextFilters);
  }

  function goToPage(page) {
    setFilters((prev) => ({ ...prev, page }));
  }

  return (
    <div className="page catalog-page">
      <h1>Course Catalog</h1>
      <SearchBar categories={categories} filters={filters} onChange={handleFilterChange} />

      {status === 'loading' && <Loading label="Loading courses..." />}
      {status === 'error' && (
        <ErrorState message={error} onRetry={() => setFilters({ ...filters })} />
      )}
      {status === 'success' && result.items.length === 0 && (
        <EmptyState message="No courses match your search. Try different filters." />
      )}

      {status === 'success' && result.items.length > 0 && (
        <>
          <div className="course-grid">
            {result.items.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          <div className="pagination">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={result.page <= 1}
              onClick={() => goToPage(result.page - 1)}
            >
              Previous
            </button>
            <span>
              Page {result.page} of {result.totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={result.page >= result.totalPages}
              onClick={() => goToPage(result.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
