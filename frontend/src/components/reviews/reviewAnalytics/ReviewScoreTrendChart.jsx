
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import './analytics.css';

const ReviewScoreTrendChart = ({ data, title, loading }) => {
  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-title">{title || 'Score Trend'}</div>
        <div className="analytics-loading">Loading chart data...</div>
      </div>
    );
  }

  if (!data || !data.length) {
    return (
      <div className="chart-card">
        <div className="chart-title">{title || 'Score Trend'}</div>
        <div className="analytics-empty">No trend data available</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-title">{title || 'Score Trend'}</div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 5]}
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorScore)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReviewScoreTrendChart;
