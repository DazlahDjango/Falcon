// src/components/reviews/pips/detail/PIPInfo.jsx
import React from 'react';
import { Calendar, Users, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const PIPInfo = ({ pip }) => {
  const infoItems = [
    {
      icon: <Users size={18} />,
      label: 'Employee',
      value: pip.employee_name,
    },
    {
      icon: <Users size={18} />,
      label: 'Owner',
      value: pip.owner_name,
    },
    {
      icon: <FileText size={18} />,
      label: 'Review Cycle',
      value: pip.review_cycle_name,
    },
    {
      icon: <Calendar size={18} />,
      label: 'Start Date',
      value: new Date(pip.start_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    {
      icon: <Calendar size={18} />,
      label: 'End Date',
      value: new Date(pip.end_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
    {
      icon: <Clock size={18} />,
      label: 'Days Remaining',
      value: pip.days_remaining !== undefined ? `${pip.days_remaining} days` : '—',
    },
  ];

  if (pip.extended_to_date) {
    infoItems.push({
      icon: <Calendar size={18} />,
      label: 'Extended To',
      value: new Date(pip.extended_to_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    });
  }

  if (pip.outcome) {
    infoItems.push({
      icon: pip.outcome === 'successful' ? <CheckCircle size={18} /> : <AlertCircle size={18} />,
      label: 'Outcome',
      value: pip.outcome_display || pip.outcome,
    });
  }

  return (
    <div className="pip-info">
      <h3 className="pip-info-title">PIP Information</h3>
      <div className="pip-info-grid">
        {infoItems.map((item, index) => (
          <div key={index} className="pip-info-item">
            <div className="pip-info-icon">{item.icon}</div>
            <div className="pip-info-content">
              <span className="pip-info-label">{item.label}</span>
              <span className="pip-info-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {pip.improvement_areas && (
        <div className="pip-info-section">
          <h4 className="pip-info-section-title">Improvement Areas</h4>
          <p className="pip-info-section-content">{pip.improvement_areas}</p>
        </div>
      )}

      {pip.success_criteria && (
        <div className="pip-info-section">
          <h4 className="pip-info-section-title">Success Criteria</h4>
          <p className="pip-info-section-content">{pip.success_criteria}</p>
        </div>
      )}

      {pip.consequences_if_failed && (
        <div className="pip-info-section">
          <h4 className="pip-info-section-title">Consequences if Failed</h4>
          <p className="pip-info-section-content">{pip.consequences_if_failed}</p>
        </div>
      )}

      {pip.consequences_if_successful && (
        <div className="pip-info-section">
          <h4 className="pip-info-section-title">Consequences if Successful</h4>
          <p className="pip-info-section-content">{pip.consequences_if_successful}</p>
        </div>
      )}
    </div>
  );
};

export default PIPInfo;