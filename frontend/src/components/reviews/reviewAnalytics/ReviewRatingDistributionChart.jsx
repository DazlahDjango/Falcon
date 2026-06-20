
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './analytics.css';

const ReviewRatingDistributionChart = ({ distribution, title, loading }) => {
  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-title">{title || 'Rating Distribution'}</div>
        <div className="analytics-loading">Loading distribution...</div>
      </div>
    );
  }

  if (!distribution || Object.keys(distribution).length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-title">{title || 'Rating Distribution'}</div>
        <div className="analytics-empty">No distribution data available</div>
      </div>
    );
  }

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const ratingOrder = ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'];
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);

  const data = ratingOrder
    .filter(rating => distribution[rating])
    .map((rating, index) => ({
      name: rating,
      value: distribution[rating],
    }));

  return (
    <div className="chart-card">
      <div className="chart-title">{title || 'Rating Distribution'}</div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReviewRatingDistributionChart;
