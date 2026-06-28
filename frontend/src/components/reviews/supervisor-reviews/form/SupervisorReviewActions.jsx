// src/components/reviews/supervisor-reviews/form/SupervisorReviewActions.jsx
import React from 'react';
import { TrendingUp, Award, DollarSign, Star } from 'lucide-react';

const SupervisorReviewActions = ({ data, onChange, disabled = false }) => {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  const recommendations = [
    { value: 'promote', label: 'Promote' },
    { value: 'bonus', label: 'Recommend Bonus' },
    { value: 'training', label: 'Training Required' },
    { value: 'development', label: 'Development Plan' },
    { value: 'pip', label: 'PIP Recommended' },
    { value: 'no_action', label: 'No Action' },
  ];

  const promotionReadiness = [
    { value: 'ready', label: 'Ready Now' },
    { value: 'soon', label: 'Ready Soon' },
    { value: 'future', label: 'Future Consideration' },
    { value: 'not_ready', label: 'Not Ready' },
  ];

  return (
    <div className="supervisor-review-actions">
      <h3 className="supervisor-review-actions-title">Review Actions</h3>

      <div className="supervisor-review-actions-group">
        <label className="supervisor-review-actions-label">Recommendation</label>
        <select
          className="supervisor-review-actions-select"
          value={data.recommendation || ''}
          onChange={(e) => handleChange('recommendation', e.target.value)}
          disabled={disabled}
        >
          <option value="">Select recommendation...</option>
          {recommendations.map((rec) => (
            <option key={rec.value} value={rec.value}>
              {rec.label}
            </option>
          ))}
        </select>
      </div>

      <div className="supervisor-review-actions-group">
        <label className="supervisor-review-actions-label">Promotion Readiness</label>
        <select
          className="supervisor-review-actions-select"
          value={data.promotion_readiness || ''}
          onChange={(e) => handleChange('promotion_readiness', e.target.value)}
          disabled={disabled}
        >
          <option value="">Select readiness...</option>
          {promotionReadiness.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {data.promotion_readiness && data.promotion_readiness !== 'not_ready' && (
        <div className="supervisor-review-actions-group">
          <label className="supervisor-review-actions-label">Target Role</label>
          <input
            type="text"
            className="supervisor-review-actions-input"
            value={data.promotion_target_role || ''}
            onChange={(e) => handleChange('promotion_target_role', e.target.value)}
            disabled={disabled}
            placeholder="Target role for promotion"
          />
        </div>
      )}

      <div className="supervisor-review-actions-group">
        <label className="supervisor-review-actions-label-checkbox">
          <input
            type="checkbox"
            checked={data.bonus_recommendation || false}
            onChange={(e) => handleChange('bonus_recommendation', e.target.checked)}
            disabled={disabled}
          />
          <Award size={16} />
          Recommend Bonus
        </label>
      </div>

      {data.bonus_recommendation && (
        <div className="supervisor-review-actions-group">
          <label className="supervisor-review-actions-label">Bonus Percentage</label>
          <input
            type="number"
            className="supervisor-review-actions-input"
            value={data.bonus_percentage || ''}
            onChange={(e) => handleChange('bonus_percentage', e.target.value)}
            disabled={disabled}
            placeholder="e.g., 10"
            min={0}
            max={100}
          />
        </div>
      )}

      <div className="supervisor-review-actions-divider" />

      <div className="supervisor-review-actions-group">
        <label className="supervisor-review-actions-label">Override KPI Score</label>
        <input
          type="number"
          className="supervisor-review-actions-input"
          value={data.override_kpi_score || ''}
          onChange={(e) => handleChange('override_kpi_score', e.target.value)}
          disabled={disabled}
          placeholder="Override KPI score"
          min={0}
          max={100}
        />
      </div>

      {data.override_kpi_score && (
        <div className="supervisor-review-actions-group">
          <label className="supervisor-review-actions-label">Override Reason</label>
          <textarea
            className="supervisor-review-actions-textarea"
            value={data.override_reason || ''}
            onChange={(e) => handleChange('override_reason', e.target.value)}
            disabled={disabled}
            placeholder="Reason for override..."
            rows={2}
          />
        </div>
      )}
    </div>
  );
};

export default SupervisorReviewActions;