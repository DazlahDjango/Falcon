// src/components/reviews/supervisor-reviews/form/SupervisorReviewComment.jsx
import React from 'react';

const SupervisorReviewComment = ({
  label,
  field,
  value = '',
  onChange,
  disabled = false,
  placeholder = '',
  rows = 3,
}) => {
  return (
    <div className="supervisor-review-comment">
      <label className="supervisor-review-comment-label">{label}</label>
      <textarea
        className="supervisor-review-comment-textarea"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};

export default SupervisorReviewComment;