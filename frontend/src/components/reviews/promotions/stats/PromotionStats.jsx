// src/components/reviews/promotions/stats/PromotionStats.jsx
import React, { useState, useEffect } from 'react';
import { usePromotions } from '../../../../hooks/reviews';
import { ReviewLoading, ReviewError } from '../../common';
import { TrendingUp, Users, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import PromotionAnalytics from './PromotionAnalytics';

const PromotionStats = () => {
  const { stats, loading, error, getStats } = usePromotions();
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getStats(year);
  }, [year, getStats]);

  const handleYearChange = (e) => {
    setYear(Number(e.target.value));
  };

  if (loading) return <ReviewLoading size="lg" text="Loading promotion statistics..." />;
  if (error) return <ReviewError error={error} onRetry={() => getStats(year)} />;
  if (!stats) return null;

  const statItems = [
    {
      icon: <Clock size={20} />,
      label: 'Pending',
      value: stats.total_pending || 0,
      color: '#f59e0b',
      bgColor: '#fef3c7',
    },
    {
      icon: <CheckCircle size={20} />,
      label: 'Approved',
      value: stats.total_approved || 0,
      color: '#22c55e',
      bgColor: '#d1fae5',
    },
    {
      icon: <XCircle size={20} />,
      label: 'Rejected',
      value: stats.total_rejected || 0,
      color: '#ef4444',
      bgColor: '#fee2e2',
    },
    {
      icon: <Award size={20} />,
      label: 'Completed',
      value: stats.total_completed || 0,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
    },
    {
      icon: <Users size={20} />,
      label: 'Total Promotions',
      value: (stats.total_pending || 0) + (stats.total_approved || 0) + (stats.total_rejected || 0) + (stats.total_completed || 0),
      color: '#3b82f6',
      bgColor: '#dbeafe',
    },
    {
      icon: <TrendingUp size={20} />,
      label: 'Avg Timeline (days)',
      value: stats.average_timeline_days?.toFixed(1) || '—',
      color: '#06b6d4',
      bgColor: '#cffafe',
    },
  ];

  return (
    <div className="promotion-stats">
      <div className="promotion-stats-header">
        <h1 className="promotion-stats-title">Promotion Statistics</h1>
        <div className="promotion-stats-controls">
          <select
            className="promotion-stats-year-select"
            value={year}
            onChange={handleYearChange}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="promotion-stats-grid">
        {statItems.map((item, index) => (
          <div key={index} className="promotion-stats-item">
            <div className="promotion-stats-item-icon" style={{ backgroundColor: item.bgColor, color: item.color }}>
              {item.icon}
            </div>
            <div className="promotion-stats-item-content">
              <span className="promotion-stats-item-value">{item.value}</span>
              <span className="promotion-stats-item-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      <PromotionAnalytics stats={stats} />
    </div>
  );
};

export default PromotionStats;