// src/components/reviews/dashboard/executive/TenantOverview.jsx
import React from 'react';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

const TenantOverview = ({ overview }) => {
  if (!overview) return null;

  const stats = [
    {
      icon: <Users size={20} />,
      label: 'Total Employees',
      value: overview.total_employees || 0,
      color: '#3b82f6',
    },
    {
      icon: <Calendar size={20} />,
      label: 'Active Cycles',
      value: overview.active_cycles || 0,
      color: '#22c55e',
    },
    {
      icon: <CheckCircle size={20} />,
      label: 'Completed Cycles',
      value: overview.completed_cycles || 0,
      color: '#8b5cf6',
    },
    {
      icon: <Clock size={20} />,
      label: 'Cycle Completion',
      value: `${overview.cycle_completion_rate || 0}%`,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="tenant-overview">
      <h3 className="tenant-overview-title">Organization Overview</h3>
      <div className="tenant-overview-stats">
        {stats.map((stat, index) => (
          <div key={index} className="tenant-overview-stat">
            <div className="tenant-overview-stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="tenant-overview-stat-content">
              <span className="tenant-overview-stat-value">{stat.value}</span>
              <span className="tenant-overview-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantOverview;