import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  return (
    <div className="course-card">
      <div className="course-card-header">
        <span className="badge">{course.category}</span>
        <span className="price">${course.price.toFixed(2)}</span>
      </div>
      <h3 className="course-title">{course.title}</h3>
      <p className="course-description">{course.description}</p>
      <div className="course-card-footer">
        <span className="rating">
          {course.reviewCount > 0
            ? `★ ${course.averageRating.toFixed(1)} (${course.reviewCount})`
            : 'No reviews yet'}
        </span>
        <span className="instructor">by {course.instructor?.name || course.instructor?.username}</span>
      </div>
      <Link to={`/courses/${course._id}`} className="btn btn-primary course-card-link">
        View course
      </Link>
    </div>
  );
}
