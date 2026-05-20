import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiBarChart2 } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const PeriodComparisonChart = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Period Comparison',
  onRefresh,
  onExport
}) => {
  const comparisonData = useMemo(() => {
    if (!data) return null;
    
    const variance = data.variance_percentage || 0;
    const isPositive = variance > 0;
    const isNegative = variance < 0;
    
    const maxValue = Math.max(data.current_score || 0, data.previous_score || 0, 100);
    const currentPercent = (data.current_score / maxValue) * 100;
    const previousPercent = (data.previous_score / maxValue) * 100;
    
    return {
      currentScore: data.current_score || 0,
      previousScore: data.previous_score || 0,
      variance: Math.abs(variance),
      isPositive,
      isNegative,
      currentPercent,
      previousPercent,
      currentPeriod: data.current_period_display,
      previousPeriod: data.previous_period_display,
      comparisonType: data.comparison_type
    };
  }, [data]);

  if (loading) {
    return <LoadingSkeleton type="chart" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load comparison" message={error} />
      </DashboardCard>
    );
  }

  if (!comparisonData) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState 
          icon="📊" 
          title="No Comparison Data" 
          message="Select or create a period comparison to see results." 
        />
      </DashboardCard>
    );
  }

  const getVarianceColor = () => {
    if (comparisonData.isPositive) return '#10b981';
    if (comparisonData.isNegative) return '#ef4444';
    return '#6b7280';
  };

  const getVarianceIcon = () => {
    if (comparisonData.isPositive) return <FiTrendingUp size={20} color="#10b981" />;
    if (comparisonData.isNegative) return <FiTrendingDown size={20} color="#ef4444" />;
    return <FiMinus size={20} color="#6b7280" />;
  };

  return (
    <DashboardCard title={title} onRefresh={onRefresh} onExport={onExport}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{comparisonData.currentPeriod}</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
              {Math.round(comparisonData.currentScore)}%
            </div>
            <TrafficLight status={comparisonData.currentScore >= 90 ? 'green' : comparisonData.currentScore >= 50 ? 'yellow' : 'red'} size="medium" />
          </div>
          
          <div style={{ fontSize: '24px', color: '#94a3b8' }}>vs</div>
          
          <div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>{comparisonData.previousPeriod}</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#64748b' }}>
              {Math.round(comparisonData.previousScore)}%
            </div>
            <TrafficLight status={comparisonData.previousScore >= 90 ? 'green' : comparisonData.previousScore >= 50 ? 'yellow' : 'red'} size="medium" />
          </div>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          background: comparisonData.isPositive ? '#f0fdf4' : comparisonData.isNegative ? '#fef2f2' : '#f8fafc',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {getVarianceIcon()}
          <span style={{ fontWeight: 600, color: getVarianceColor() }}>
            {comparisonData.isPositive ? '+' : ''}{comparisonData.variance.toFixed(1)}% 
          </span>
          <span style={{ color: '#64748b' }}>
            {comparisonData.isPositive ? 'increase' : comparisonData.isNegative ? 'decrease' : 'no change'}
          </span>
        </div>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
          <span>{comparisonData.previousPeriod}</span>
          <span>{comparisonData.currentPeriod}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '10px', height: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              width: `${comparisonData.previousPercent}%`,
              height: '100%',
              background: '#94a3b8',
              borderRadius: '10px',
              transition: 'width 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '8px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 500
            }}>
              {comparisonData.previousPercent > 15 && `${Math.round(comparisonData.previousScore)}%`}
            </div>
          </div>
          <FiBarChart2 size={16} color="#64748b" />
          <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '10px', height: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              width: `${comparisonData.currentPercent}%`,
              height: '100%',
              background: getVarianceColor(),
              borderRadius: '10px',
              transition: 'width 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '8px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 500
            }}>
              {comparisonData.currentPercent > 15 && `${Math.round(comparisonData.currentScore)}%`}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '12px',
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Absolute Change</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: getVarianceColor() }}>
            {comparisonData.isPositive ? '+' : ''}{(comparisonData.currentScore - comparisonData.previousScore).toFixed(1)}%
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Relative Change</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: getVarianceColor() }}>
            {comparisonData.isPositive ? '+' : ''}{comparisonData.variance.toFixed(1)}%
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Performance Gap</div>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            {Math.abs(comparisonData.currentScore - comparisonData.previousScore).toFixed(1)}%
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

PeriodComparisonChart.propTypes = {
  data: PropTypes.shape({
    current_score: PropTypes.number,
    previous_score: PropTypes.number,
    variance_percentage: PropTypes.number,
    current_period_display: PropTypes.string,
    previous_period_display: PropTypes.string,
    comparison_type: PropTypes.string
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func
};