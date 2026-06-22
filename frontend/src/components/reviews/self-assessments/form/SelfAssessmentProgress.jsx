// src/components/reviews/self-assessments/form/SelfAssessmentProgress.jsx
import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const SelfAssessmentProgress = ({ assessment, cycle }) => {
  const isSubmitted = assessment?.status === 'submitted';
  const isOverdue = cycle?.self_assessment_deadline && new Date(cycle.self_assessment_deadline) < new Date();
  const daysRemaining = cycle?.self_assessment_deadline
    ? Math.ceil((new Date(cycle.self_assessment_deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const progressItems = [
    {
      label: 'Overall Progress',
      status: isSubmitted ? 'Complete' : 'In Progress',
      icon: isSubmitted ? <CheckCircle size={20} color="#22c55e" /> : <Clock size={20} color="#f59e0b" />,
      color: isSubmitted ? '#22c55e' : '#f59e0b',
    },
    {
      label: 'Status',
      status: isSubmitted ? 'Submitted' : 'Draft',
      icon: isSubmitted ? <CheckCircle size={20} color="#22c55e" /> : <Clock size={20} color="#6b7280" />,
      color: isSubmitted ? '#22c55e' : '#6b7280',
    },
    {
      label: 'Deadline',
      status: cycle?.self_assessment_deadline
        ? new Date(cycle.self_assessment_deadline).toLocaleDateString()
        : 'Not set',
      icon: isOverdue ? <AlertCircle size={20} color="#ef4444" /> : <Clock size={20} color="#6b7280" />,
      color: isOverdue ? '#ef4444' : '#6b7280',
    },
    {
      label: 'Days Remaining',
      status: daysRemaining !== null ? `${daysRemaining} days` : 'N/A',
      icon: <Clock size={20} color={daysRemaining < 0 ? '#ef4444' : '#6b7280'} />,
      color: daysRemaining < 0 ? '#ef4444' : '#6b7280',
    },
  ];

  return (
    <div className="self-assessment-progress">
      <div className="self-assessment-progress-grid">
        {progressItems.map((item, index) => (
          <div key={index} className="self-assessment-progress-item">
            <div className="self-assessment-progress-icon" style={{ color: item.color }}>
              {item.icon}
            </div>
            <div className="self-assessment-progress-content">
              <span className="self-assessment-progress-label">{item.label}</span>
              <span className="self-assessment-progress-status" style={{ color: item.color }}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      {isOverdue && !isSubmitted && (
        <div className="self-assessment-progress-warning">
          <AlertCircle size={16} />
          This assessment is overdue. Please submit as soon as possible.
        </div>
      )}
      {isSubmitted && (
        <div className="self-assessment-progress-success">
          <CheckCircle size={16} />
          Assessment submitted successfully!
        </div>
      )}
    </div>
  );
};

export default SelfAssessmentProgress;