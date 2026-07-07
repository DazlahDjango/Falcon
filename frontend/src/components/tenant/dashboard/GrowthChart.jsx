// components/tenant/dashboard/GrowthChart.jsx
import React from 'react';

const GrowthChart = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card" style={{ textAlign: 'center', padding: '24px 0' }}>
        <p className="dashboard-text-sm dashboard-text-muted">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value || 0), 10);
  const labels = data.map(d => d.label || '');
  const values = data.map(d => d.value || 0);
  const barColors = data.map(d => d.color || '#3b82f6');

  return (
    <div className="dashboard-card">
      {title && <h4 className="dashboard-font-semibold dashboard-text-sm dashboard-mb-4" style={{ color: '#0f172a' }}>{title}</h4>}
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'flex-end', gap: '8px', paddingTop: '8px' }}>
        {values.map((value, index) => {
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const barHeight = Math.max(percentage, 4);
          return (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <div
                style={{
                  width: '100%',
                  height: `${barHeight}%`,
                  background: barColors[index] || '#3b82f6',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '4px',
                  transition: 'height 0.5s ease',
                }}
              />
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {labels[index] || ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrowthChart;