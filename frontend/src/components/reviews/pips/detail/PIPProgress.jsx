// src/components/reviews/pips/detail/PIPProgress.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectPIPProgress } from '../../../../store/reviews/selectors';
import { ReviewLoading } from '../../common';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

const PIPProgress = ({ pipId }) => {
  const progress = useSelector((state) => selectPIPProgress(state));

  if (!progress) return <ReviewLoading size="sm" text="Loading progress..." />;

  const statusItems = [
    {
      key: 'completed',
      label: 'Completed',
      count: progress.completed_actions || 0,
      icon: <CheckCircle size={16} color="#22c55e" />,
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      count: progress.in_progress_actions || 0,
      icon: <Clock size={16} color="#f59e0b" />,
    },
    {
      key: 'pending',
      label: 'Pending',
      count: progress.pending_actions || 0,
      icon: <Clock size={16} color="#6b7280" />,
    },
    {
      key: 'missed',
      label: 'Missed',
      count: progress.missed_actions || 0,
      icon: <XCircle size={16} color="#ef4444" />,
    },
  ];

  return (
    <div className="pip-progress">
      <h3 className="pip-progress-title">Progress Overview</h3>
      
      <div className="pip-progress-stats">
        <div className="pip-progress-stat">
          <span className="pip-progress-stat-value">{progress.completion_percentage || 0}%</span>
          <span className="pip-progress-stat-label">Completion</span>
        </div>
        <div className="pip-progress-stat">
          <span className="pip-progress-stat-value">{progress.days_elapsed || 0}</span>
          <span className="pip-progress-stat-label">Days Elapsed</span>
        </div>
        <div className="pip-progress-stat">
          <span className="pip-progress-stat-value">{progress.days_remaining || 0}</span>
          <span className="pip-progress-stat-label">Days Remaining</span>
        </div>
        <div className="pip-progress-stat">
          <span className="pip-progress-stat-value">{progress.total_actions || 0}</span>
          <span className="pip-progress-stat-label">Total Actions</span>
        </div>
      </div>

      <div className="pip-progress-bar">
        <div
          className="pip-progress-fill"
          style={{ width: `${progress.completion_percentage || 0}%` }}
        />
      </div>

      <div className="pip-progress-status-items">
        {statusItems.map((item) => (
          <div key={item.key} className="pip-progress-status-item">
            <div className="pip-progress-status-icon">{item.icon}</div>
            <div className="pip-progress-status-content">
              <span className="pip-progress-status-count">{item.count}</span>
              <span className="pip-progress-status-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      {progress.needs_attention && (
        <div className="pip-progress-attention">
          <AlertCircle size={16} />
          <span>This PIP needs attention. {progress.missed_actions || 0} missed actions.</span>
        </div>
      )}

      {progress.is_on_track && (
        <div className="pip-progress-ontrack">
          <CheckCircle size={16} />
          <span>This PIP is on track.</span>
        </div>
      )}
    </div>
  );
};

export default PIPProgress;