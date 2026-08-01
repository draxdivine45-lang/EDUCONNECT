import { EmptyState } from './StatusStates';

export default function ReviewList({ reviews, currentUserId, onDelete }) {
  if (!reviews.length) {
    return <EmptyState message="No reviews yet. Be the first to review this course!" />;
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <li key={review._id} className="review-item">
          <div className="review-item-header">
            <span className="review-author">
              {review.student?.name || review.student?.username || 'Anonymous'}
            </span>
            <span className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </span>
          </div>
          {review.comment && <p className="review-comment">{review.comment}</p>}
          {currentUserId && review.student?._id === currentUserId && (
            <button type="button" className="btn btn-link" onClick={() => onDelete(review._id)}>
              Delete my review
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
