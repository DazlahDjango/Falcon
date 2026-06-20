
import React from 'react';
import { TrendingUp, TrendingDown, Minus, Users, CheckCircle, Activity, Award, AlertTriangle } from 'lucide-react';
import './analytics.css';

const ReviewCompanyAnalytics = ({ analytics, loading }) => {
  if (loading) {
    return <div className="analytics-loading">Loading company analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-empty">No company analytics available</div>;
  }

  const stats = [
    {
      title: 'Average Score',
      value: analytics.average_score?.toFixed(1) || 'N/A',
      icon: Activity,
      color: 'blue',
      trend: analytics.score_change,
      trendLabel: analytics.percentage_change ? `${analytics.percentage_change}%` : null,
    },
    {
      title: 'Total Employees',
      value: analytics.total_employees || 0,
      icon: Users,
      color: 'green',
      trend: null,
    },
    {
      title: 'Reviews Completed',
      value: analytics.total_reviews_completed || 0,
      icon: CheckCircle,
      color: 'purple',
      trend: null,
    },
    {
      title: 'Completion Rate',
      value: analytics.completion_rate ? `${analytics.completion_rate}%` : 'N/A',
      icon: TrendingUp,
      color: 'orange',
      trend: null,
    },
    {
      title: 'Promotions',
      value: analytics.promotions_count || 0,
      icon: Award,
      color: 'emerald',
      trend: null,
    },
    {
      title: 'Active PIPs',
      value: analytics.pips_created || 0,
      icon: AlertTriangle,
      color: 'red',
      trend: null,
    },
  ];

  const getTrendClass = (trend) => {
    if (trend > 0) return 'trend-up';
    if (trend < 0) return 'trend-down';
    return 'trend-neutral';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp size={14} />;
    if (trend < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getIconColor = (color) => {
    const colorMap = {
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#8b5cf6',
      orange: '#f59e0b',
      emerald: '#059669',
      red: '#ef4444',
    };
    return colorMap[color] || '#6b7280';
  };

  return (
    <div className="analytics-stats-grid">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="stat-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="stat-card-title">{stat.title}</div>
                <div className="stat-card-value">{stat.value}</div>
                {stat.trend !== null && (
                  <div className={`stat-card-trend ${getTrendClass(stat.trend)}`}>
                    {getTrendIcon(stat.trend)}
                    <span style={{ marginLeft: '4px' }}>
                      {Math.abs(stat.trend).toFixed(1)} points
                    </span>
                    {stat.trendLabel && <span style={{ marginLeft: '4px' }}>({stat.trendLabel})</span>}
                  </div>
                )}
              </div>
              <div
                className="p-3 rounded-xl"
                style={{
                  background: `${getIconColor(stat.color)}15`,
                }}
              >
                <IconComponent size={24} style={{ color: getIconColor(stat.color) }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewCompanyAnalytics;
