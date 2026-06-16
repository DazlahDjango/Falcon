// src/components/reviews/reports/employee/EmployeeCompetencyComparison.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const EmployeeCompetencyComparison = ({ comparison = [] }) => {
  if (!comparison || comparison.length === 0) {
    return (
      <div className="employee-competency-comparison">
        <h3 className="employee-competency-comparison-title">Competency Comparison</h3>
        <div className="employee-competency-comparison-empty">
          <p>No competency comparison data available</p>
        </div>
      </div>
    );
  }

  const getGapIcon = (gap) => {
    if (gap === 0) return <Minus size={14} color="#6b7280" />;
    if (gap > 0) return <TrendingUp size={14} color="#22c55e" />;
    return <TrendingDown size={14} color="#ef4444" />;
  };

  const getGapColor = (gap) => {
    if (gap === 0) return '#6b7280';
    if (gap > 0) return '#22c55e';
    return '#ef4444';
  };

  const needsDiscussion = comparison.filter(c => c.needs_discussion);

  return (
    <div className="employee-competency-comparison">
      <h3 className="employee-competency-comparison-title">Competency Comparison</h3>
      
      {needsDiscussion.length > 0 && (
        <div className="employee-competency-comparison-alert">
          <span className="employee-competency-comparison-alert-icon">⚠️</span>
          <span>{needsDiscussion.length} competencies need discussion</span>
        </div>
      )}

      <div className="employee-competency-comparison-list">
        {comparison.map((item, index) => (
          <div key={index} className={`employee-competency-comparison-item ${item.needs_discussion ? 'needs-discussion' : ''}`}>
            <div className="employee-competency-comparison-item-header">
              <span className="employee-competency-comparison-item-name">{item.competency}</span>
              <span className="employee-competency-comparison-item-gap" style={{ color: getGapColor(item.gap) }}>
                {getGapIcon(item.gap)}
                {item.gap !== null && item.gap !== undefined ? item.gap.toFixed(1) : '—'}
              </span>
            </div>
            <div className="employee-competency-comparison-item-scores">
              <span className="employee-competency-comparison-item-self">
                Self: {item.self_score || '—'}
              </span>
              <span className="employee-competency-comparison-item-supervisor">
                Supervisor: {item.supervisor_score || '—'}
              </span>
            </div>
            {item.needs_discussion && (
              <div className="employee-competency-comparison-item-discussion">
                ⚠️ Needs discussion
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeCompetencyComparison;