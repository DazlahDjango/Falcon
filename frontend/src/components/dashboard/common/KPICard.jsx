import React from 'react';
import PropTypes from 'prop-types';
import { TrafficLight } from './TrafficLight';
import { TrendIndicator } from './TrendIndicator';

export const KPICard = ({
  kpi,
  onClick = null,
  className = '',
  showTrend = true,
  compact = false
}) => {
  const {
    id,
    name,
    current_score,
    target_value,
    actual_value,
    status,
    trend,
    unit,
    category
  } = kpi;

  const score = current_score !== undefined ? current_score : 
    (actual_value && target_value ? (actual_value / target_value) * 100 : null);
  
  const scoreDisplay = score !== null ? `${Math.round(score)}%` : 'N/A';
  const actualDisplay = actual_value !== undefined ? actual_value : '—';
  const targetDisplay = target_value !== undefined ? target_value : '—';

  return (
    <div 
      className={`kpi-card kpi-card--${status} ${compact ? 'kpi-card--compact' : ''} ${className}`}
      onClick={onClick ? () => onClick(id) : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="kpi-card__header">
        <div className="kpi-card__category">{category || 'KPI'}</div>
        {showTrend && trend && <TrendIndicator trend={trend} />}
      </div>
      
      <div className="kpi-card__body">
        <h4 className="kpi-card__title">{name}</h4>
        
        <div className="kpi-card__score">
          <TrafficLight status={status} size={compact ? 'small' : 'medium'} />
          <span className="kpi-card__score-value">{scoreDisplay}</span>
        </div>
        
        {!compact && (
          <div className="kpi-card__details">
            <div className="detail-item">
              <span className="detail-label">Actual:</span>
              <span className="detail-value">{actualDisplay} {unit || ''}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Target:</span>
              <span className="detail-value">{targetDisplay} {unit || ''}</span>
            </div>
          </div>
        )}
      </div>
      
      {!compact && (
        <div className="kpi-card__footer">
          <div className="progress-bar">
            <div 
              className={`progress-bar__fill progress-bar__fill--${status}`}
              style={{ width: `${Math.min(100, Math.max(0, score || 0))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

KPICard.propTypes = {
  kpi: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    current_score: PropTypes.number,
    target_value: PropTypes.number,
    actual_value: PropTypes.number,
    status: PropTypes.oneOf(['green', 'yellow', 'red']),
    trend: PropTypes.oneOf(['up', 'down', 'stable']),
    unit: PropTypes.string,
    category: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  showTrend: PropTypes.bool,
  compact: PropTypes.bool
};