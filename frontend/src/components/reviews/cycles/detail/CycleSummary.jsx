// src/components/reviews/cycles/detail/CycleSummary.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCycleSummary } from '../../../../store/reviews/selectors';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ReviewLoading } from '../../common';

const CycleSummary = ({ cycleId }) => {
  const summary = useSelector((state) => selectCycleSummary(state));

  if (!summary) return <ReviewLoading size="sm" text="Loading summary..." />;

  const stats = [
    {
      icon: <FileText size={18} />,
      label: 'Self Assessments',
      value: summary.self_assessment?.submitted || 0,
      total: summary.self_assessment?.total || 0,
      color: '#3b82f6',
    },
    {
      icon: <CheckCircle size={18} />,
      label: 'Supervisor Reviews',
      value: summary.supervisor_review?.approved || 0,
      total: summary.supervisor_review?.total || 0,
      color: '#22c55e',
    },
    {
      icon: <CheckCircle size={18} />,
      label: 'Final Ratings',
      value: summary.final_rating?.locked || 0,
      total: summary.final_rating?.total || 0,
      color: '#8b5cf6',
    },
    {
      icon: <AlertCircle size={18} />,
      label: 'Pending Actions',
      value: 
        (summary.self_assessment?.total || 0) - (summary.self_assessment?.submitted || 0) +
        (summary.supervisor_review?.total || 0) - (summary.supervisor_review?.approved || 0) +
        (summary.final_rating?.total || 0) - (summary.final_rating?.locked || 0),
      color: '#f97316',
    },
  ];

  return (
    <div className="cycle-summary">
      <h3 className="cycle-summary-title">Summary</h3>
      <div className="cycle-summary-grid">
        {stats.map((stat, index) => (
          <div key={index} className="cycle-summary-item">
            <div className="cycle-summary-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="cycle-summary-content">
              <span className="cycle-summary-value">
                {stat.value} / {stat.total}
              </span>
              <span className="cycle-summary-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CycleSummary;