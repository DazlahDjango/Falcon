import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const TrendChartWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Performance Trends',
  chartType = 'line',
  onRefresh,
  onExport,
  height = 300
}) => {
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !data.length) return;

    const processData = () => {
      const labels = data.map(item => item.label || item.month || item.period);
      const datasets = [];

      if (data[0]?.values) {
        Object.keys(data[0].values).forEach(key => {
          datasets.push({
            label: key,
            data: data.map(item => item.values[key]),
            borderColor: getColorForMetric(key),
            backgroundColor: `${getColorForMetric(key)}20`,
            fill: chartType === 'area'
          });
        });
      } else if (data[0]?.value !== undefined) {
        datasets.push({
          label: title,
          data: data.map(item => item.value),
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f620',
          fill: chartType === 'area'
        });
      } else if (data[0]?.actual !== undefined) {
        datasets.push({
          label: 'Actual',
          data: data.map(item => item.actual),
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f620'
        });
        if (data[0]?.target !== undefined) {
          datasets.push({
            label: 'Target',
            data: data.map(item => item.target),
            borderColor: '#f59e0b',
            borderDash: [5, 5],
            fill: false
          });
        }
      }

      setChartData({ labels, datasets });
    };

    processData();
  }, [data, title, chartType]);

  const getColorForMetric = (key) => {
    const colors = {
      revenue: '#10b981',
      users: '#3b82f6',
      satisfaction: '#8b5cf6',
      completion: '#f59e0b',
      default: '#6b7280'
    };
    return colors[key?.toLowerCase()] || colors.default;
  };

  if (loading) {
    return <LoadingSkeleton type="chart" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState 
          title="Failed to load trend data"
          message={error}
          actionLabel="Retry"
          onAction={onRefresh}
        />
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh} onExport={onExport}>
        <EmptyState 
          title="No Trend Data"
          message="There is no trend data available for the selected period."
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title={title} onRefresh={onRefresh} onExport={onExport}>
      <div style={{ height, position: 'relative' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {chartData?.datasets?.map(dataset => (
            <div key={dataset.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '2px',
                backgroundColor: dataset.borderColor,
                ...(dataset.borderDash ? { border: `1px dashed ${dataset.borderColor}`, backgroundColor: 'transparent' } : {})
              }} />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{dataset.label}</span>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: height - 60 }}>
          {chartData?.labels?.map((label, idx) => {
            const maxValue = Math.max(...(chartData.datasets.flatMap(d => d.data)));
            const dataset = chartData.datasets[0];
            const value = dataset.data[idx];
            const percentage = (value / maxValue) * 100;
            
            return (
              <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                <div 
                  style={{ 
                    height: `${percentage}%`,
                    minHeight: '4px',
                    backgroundColor: dataset.borderColor,
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease',
                    width: chartType === 'bar' ? '40px' : '100%',
                    margin: '0 auto'
                  }}
                />
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
          <span>📈 Hover for details | </span>
          <span>📅 Last 12 months</span>
        </div>
      </div>
    </DashboardCard>
  );
};

TrendChartWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    month: PropTypes.string,
    period: PropTypes.string,
    value: PropTypes.number,
    actual: PropTypes.number,
    target: PropTypes.number,
    values: PropTypes.object
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  chartType: PropTypes.oneOf(['line', 'bar', 'area']),
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  height: PropTypes.number
};