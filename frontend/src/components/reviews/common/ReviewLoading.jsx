// src/components/reviews/common/ReviewLoading.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ReviewLoading = ({
  size = 'md',
  variant = 'spinner',
  text = 'Loading...',
  fullPage = false,
}) => {
  const sizeMap = {
    sm: 'review-loading-sm',
    md: 'review-loading-md',
    lg: 'review-loading-lg',
  };

  const classes = [
    'review-loading',
    sizeMap[size],
    variant === 'skeleton' ? 'review-loading-skeleton' : 'review-loading-spinner',
    fullPage ? 'review-loading-fullpage' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {variant === 'spinner' && (
        <div className="review-spinner">
          <div className="review-spinner-ring"></div>
        </div>
      )}
      {variant === 'skeleton' && (
        <div className="review-skeleton">
          <div className="review-skeleton-line"></div>
          <div className="review-skeleton-line"></div>
          <div className="review-skeleton-line short"></div>
        </div>
      )}
      {text && <span className="review-loading-text">{text}</span>}
    </div>
  );
};

ReviewLoading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['spinner', 'skeleton']),
  text: PropTypes.string,
  fullPage: PropTypes.bool,
};

export default ReviewLoading;