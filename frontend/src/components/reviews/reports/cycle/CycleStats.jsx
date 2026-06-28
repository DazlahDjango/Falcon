// src/components/reviews/reports/cycle/CycleStats.jsx
import React from 'react';
import { Users, TrendingUp, Award, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ReviewScoreGauge } from '../../common';

const CycleStats = ({ stats }) => {
  if (!stats) return null;

  const statItems = [
    {
      icon: <Users size={18} />,
      label: 'Total Employees',
      value: stats.total_employees || 0,
      color: '#3b82f6',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Average Score',
      value: stats.average_score !== null ? `${stats.average_score}%` : '—',
      color: '#f59e0b',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Min Score',
      value: stats.min_score !== null ? `${stats.min_score}%` : '—',
      color: '#ef4444',
    },
    {
      icon: <TrendingUp size={18} />,
      label: 'Max Score',
      value: stats.max_score !== null ? `${stats.max_score}%` : '—',
      color: '#22c55e',
    },
    {
      icon: <Award size={18} />,
      label: 'Promotions',
      value: stats.promotions || 0,
      color: '#8b5cf6',
    },
    {
      icon: <AlertCircle size={18} />,
      label: 'PIPs',
      value: stats.pips || 0,
      color: '#ef4444',
    },
  ];

  return (
    <div className="cycle-stats">
      <h3 className="cycle-stats-title">Statistics</h3>
      
      <div className="cycle-stats-grid">
        {statItems.map((stat, index) => (
          <div key={index} className="cycle-stats-item">
            <div className="cycle-stats-item-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="cycle-stats-item-content">
              <span className="cycle-stats-item-value">{stat.value}</span>
              <span className="cycle-stats-item-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {stats.average_score !== null && (
        <div className="cycle-stats-gauge">
          <ReviewScoreGauge
            score={stats.average_score}
            label="Average Score"
            size="lg"
          />
        </div>
      )}
    </div>
  );
};

export default CycleStats;