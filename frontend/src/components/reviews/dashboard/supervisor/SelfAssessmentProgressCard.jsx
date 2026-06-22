// src/components/reviews/dashboard/supervisor/SelfAssessmentProgressCard.jsx
import React from 'react';
import { FileText, CheckCircle, Clock } from 'lucide-react';

const SelfAssessmentProgressCard = ({ progress }) => {
  if (!progress) return null;

  return (
    <div className="self-assessment-progress-card">
      <h3 className="self-assessment-progress-card-title">
        <FileText size={18} />
        Self Assessment Progress
      </h3>
      <div className="self-assessment-progress-card-stats">
        <div className="self-assessment-progress-card-stat">
          <span className="self-assessment-progress-card-value">
            {progress.submitted || 0}
          </span>
          <span className="self-assessment-progress-card-label">Submitted</span>
        </div>
        <div className="self-assessment-progress-card-stat">
          <span className="self-assessment-progress-card-value" style={{ color: '#f59e0b' }}>
            {progress.pending || 0}
          </span>
          <span className="self-assessment-progress-card-label">Pending</span>
        </div>
        <div className="self-assessment-progress-card-stat">
          <span className="self-assessment-progress-card-value" style={{ color: '#2563eb' }}>
            {progress.percentage || 0}%
          </span>
          <span className="self-assessment-progress-card-label">Completion</span>
        </div>
      </div>
      <div className="self-assessment-progress-card-bar">
        <div
          className="self-assessment-progress-card-fill"
          style={{ width: `${progress.percentage || 0}%` }}
        />
      </div>
    </div>
  );
};

export default SelfAssessmentProgressCard;