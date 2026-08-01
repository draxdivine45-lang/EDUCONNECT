export function Loading({ label = 'Loading...' }) {
  return (
    <div className="status-state status-loading" role="status">
      <div className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="status-state status-error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'Nothing to show yet.', action }) {
  return (
    <div className="status-state status-empty">
      <p>{message}</p>
      {action}
    </div>
  );
}
