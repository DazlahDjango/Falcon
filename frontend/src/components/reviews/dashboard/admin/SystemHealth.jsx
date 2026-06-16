// src/components/reviews/dashboard/admin/SystemHealth.jsx
import React from 'react';
import { Activity, CheckCircle, AlertCircle, Clock, Users, FileText } from 'lucide-react';

const SystemHealth = ({ health }) => {
  if (!health) return null;

  const stats = [
    {
      icon: <FileText size={18} />,
      label: 'Active Cycles',
      value: health.active_review_cycles || 0,
      color: '#3b82f6',
    },
    {
      icon: <Users size={18} />,
      label: 'Pending Self Assessments',
      value: health.pending_self_assessments || 0,
      color: '#f59e0b',
    },
    {
      icon: <Users size={18} />,
      label: 'Pending Supervisor Reviews',
      value: health.pending_supervisor_reviews || 0,
      color: '#f59e0b',
    },
    {
      icon: <AlertCircle size={18} />,
      label: 'Overdue Self Assessments',
      value: health.overdue_self_assessments || 0,
      color: '#ef4444',
    },
    {
      icon: <AlertCircle size={18} />,
      label: 'Overdue Supervisor Reviews',
      value: health.overdue_supervisor_reviews || 0,
      color: '#ef4444',
    },
  ];

  return (
    <div className="system-health">
      <h3 className="system-health-title">
        <Activity size={18} />
        System Health
      </h3>
      <div className="system-health-stats">
        {stats.map((stat, index) => (
          <div key={index} className="system-health-stat">
            <div className="system-health-stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="system-health-stat-content">
              <span className="system-health-stat-value">{stat.value}</span>
              <span className="system-health-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHealth;