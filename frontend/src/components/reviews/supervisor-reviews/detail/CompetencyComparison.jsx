// src/components/reviews/supervisor-reviews/detail/CompetencyComparison.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CompetencyComparison = ({ comparison }) => {
  if (!comparison || !comparison.comparison || comparison.comparison.length === 0) {
    return (
      <div className="competency-comparison-empty">
        <p>No competency comparison data available.</p>
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

  return (
    <div className="competency-comparison">
      <h3 className="competency-comparison-title">Competency Gap Analysis</h3>
      <p className="competency-comparison-subtitle">
        Comparing self assessment vs supervisor ratings
      </p>

      <div className="competency-comparison-table">
        <div className="competency-comparison-header">
          <span className="competency-comparison-header-name">Competency</span>
          <span className="competency-comparison-header-self">Self</span>
          <span className="competency-comparison-header-supervisor">Supervisor</span>
          <span className="competency-comparison-header-gap">Gap</span>
        </div>

        {comparison.comparison.map((item, index) => (
          <div key={index} className="competency-comparison-row">
            <span className="competency-comparison-name">{item.competency}</span>
            <span className="competency-comparison-self">{item.self_score || '—'}</span>
            <span className="competency-comparison-supervisor">{item.supervisor_score || '—'}</span>
            <span
              className="competency-comparison-gap"
              style={{ color: getGapColor(item.gap) }}
            >
              {getGapIcon(item.gap)}
              {item.gap !== null && item.gap !== undefined ? item.gap.toFixed(1) : '—'}
            </span>
          </div>
        ))}
      </div>

      <div className="competency-comparison-summary">
        <div className="competency-comparison-summary-item">
          <span className="competency-comparison-summary-label">Total Competencies</span>
          <span className="competency-comparison-summary-value">{comparison.total_competencies || 0}</span>
        </div>
        <div className="competency-comparison-summary-item">
          <span className="competency-comparison-summary-label">Average Gap</span>
          <span className="competency-comparison-summary-value">
            {comparison.average_gap !== null ? comparison.average_gap.toFixed(2) : '—'}
          </span>
        </div>
        <div className="competency-comparison-summary-item">
          <span className="competency-comparison-summary-label">Over-rated</span>
          <span className="competency-comparison-summary-value">{comparison.over_rated?.length || 0}</span>
        </div>
        <div className="competency-comparison-summary-item">
          <span className="competency-comparison-summary-label">Under-rated</span>
          <span className="competency-comparison-summary-value">{comparison.under_rated?.length || 0}</span>
        </div>
      </div>

      {comparison.largest_gaps && comparison.largest_gaps.length > 0 && (
        <div className="competency-comparison-largest">
          <h4 className="competency-comparison-largest-title">Largest Gaps</h4>
          {comparison.largest_gaps.map((gap, index) => (
            <div key={index} className="competency-comparison-largest-item">
              <span className="competency-comparison-largest-name">{gap.competency}</span>
              <span
                className="competency-comparison-largest-value"
                style={{ color: getGapColor(gap.gap) }}
              >
                {gap.gap > 0 ? '+' : ''}{gap.gap.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetencyComparison;