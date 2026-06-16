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
}) => {
  return (
    <div className="self-assessment-comment">
      <label className="self-assessment-comment-label">{label}</label>
      <textarea
        className="self-assessment-comment-textarea"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};

export default SelfAssessmentComment;