// src/components/reviews/common/ReviewEmptyState.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ReviewEmptyState = ({
  title = 'No Data Found',
  description = 'There are no items to display at the moment.',
  icon = '📭',
  actionLabel = null,
  onAction = null,
  actionVariant = 'primary',
}) => {
  return (
    <div className="review-empty-state">
      <div className="review-empty-icon">{icon}</div>
      <h3 className="review-empty-title">{title}</h3>
      <p className="review-empty-description">{description}</p>
      {actionLabel && onAction && (
        <button
          className={`btn btn-${actionVariant} review-empty-action`}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

ReviewEmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.node,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  actionVariant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
};

export default ReviewEmptyState;