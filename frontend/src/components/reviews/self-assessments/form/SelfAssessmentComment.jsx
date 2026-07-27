// src/components/reviews/self-assessments/form/SelfAssessmentComment.jsx
import React from 'react';

const SelfAssessmentComment = ({
  label,
  field,
  value = '',
  onChange,
  disabled = false,
  placeholder = '',
  rows = 3,
  maxLength = 2000,
}) => {
  return (
    <div className="self-assessment-comment">
      <div className="self-assessment-comment-header">
        <label className="self-assessment-comment-label">{label}</label>
        {!disabled && (
          <span className="self-assessment-comment-counter">
            {value.length} / {maxLength}
          </span>
        )}
      </div>
      <textarea
        className="self-assessment-comment-textarea"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
      />
    </div>
  );
};

export default SelfAssessmentComment;