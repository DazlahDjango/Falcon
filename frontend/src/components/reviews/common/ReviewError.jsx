// src/components/reviews/common/ReviewError.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ReviewError = ({
  error,
  onRetry,
  title = 'Something went wrong',
  showRetry = true,
  variant = 'default',
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

  return (
    <div className={`review-error review-error-${variant}`}>
      <div className="review-error-icon">⚠️</div>
      <div className="review-error-content">
        <h4 className="review-error-title">{title}</h4>
        <p className="review-error-message">{errorMessage}</p>
        {showRetry && onRetry && (
          <button className="btn btn-outline review-error-retry" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

ReviewError.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRetry: PropTypes.func,
  title: PropTypes.string,
  showRetry: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'inline', 'full-page']),
};

export default ReviewError;