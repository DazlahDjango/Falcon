// src/components/reviews/dashboard/staff/StaffPIPStatus.jsx
import React from 'react';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { ReviewStatusBadge } from '../../common';

const StaffPIPStatus = ({ pip }) => {
  if (!pip) {
    return (
      <div className="staff-pip-status">
        <h3 className="staff-pip-status-title">Performance Plan</h3>
        <div className="staff-pip-status-empty">
          <CheckCircle size={24} color="#22c55e" />
          <p>No active Performance Improvement Plan</p>
        </div>
      </div>
    );
  }

  const isOverdue = pip.days_remaining < 0;

  return (
    <div className="staff-pip-status">
      <h3 className="staff-pip-status-title">
        <AlertTriangle size={18} color="#f59e0b" />
        Performance Improvement Plan
      </h3>
      <div className="staff-pip-status-content">
        <div className="staff-pip-status-header">
          <span className="staff-pip-status-title-text">{pip.title}</span>
          <ReviewStatusBadge status={pip.status} size="sm" />
        </div>
        <div className="staff-pip-status-progress">
          <div className="staff-pip-status-progress-header">
            <span>Progress</span>
            <span>{pip.progress}%</span>
          </div>
          <div className="staff-pip-status-progress-bar">
            <div
              className="staff-pip-status-progress-fill"
              style={{ width: `${pip.progress}%` }}
            />
          </div>
        </div>
        <div className="staff-pip-status-meta">
          <span className="staff-pip-status-days">
            <Clock size={14} />
            {isOverdue ? (
              <span style={{ color: '#ef4444' }}>
                Overdue by {Math.abs(pip.days_remaining)} days
              </span>
            ) : (
              <span>{pip.days_remaining} days remaining</span>
            )}
          </span>
          <span className="staff-pip-status-progress-label">
            <TrendingUp size={14} />
            {pip.progress >= 80 ? 'On track' : 'In progress'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StaffPIPStatus;