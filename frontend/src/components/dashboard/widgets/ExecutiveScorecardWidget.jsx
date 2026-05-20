import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { ScoreGauge } from '../common/ScoreGauge';
import { TrendIndicator } from '../common/TrendIndicator';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const ExecutiveScorecardWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Executive Scorecard',
  onRefresh,
  onMetricClick
}) => {
  const metrics = useMemo(() => {
    if (!data) return null;
    
    return {
      overallHealth: data.overall_health_score || 0,
      totalKPIs: data.total_kpis || 0,
      onTrackKPIs: data.kpi_green_count || 0,
      atRiskKPIs: data.kpi_yellow_count || 0,
      offTrackKPIs: data.kpi_red_count || 0,
      completionRate: data.overall_completion_rate || 0,
      employeeEngagement: data.employee_engagement || 0,
      revenueGrowth: data.revenue_growth || 0,
      customerSatisfaction: data.customer_satisfaction || 0
    };
  }, [data]);

  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load scorecard" message={error} />
      </DashboardCard>
    );
  }

  if (!metrics) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Scorecard Data" message="No executive scorecard data available." />
      </DashboardCard>
    );
  }

  const getStatusFromScore = (score) => {
    if (score >= 90) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const kpiStatusCount = [
    { label: 'On Track', count: metrics.onTrackKPIs, status: 'green', percentage: (metrics.onTrackKPIs / metrics.totalKPIs) * 100 },
    { label: 'At Risk', count: metrics.atRiskKPIs, status: 'yellow', percentage: (metrics.atRiskKPIs / metrics.totalKPIs) * 100 },
    { label: 'Off Track', count: metrics.offTrackKPIs, status: 'red', percentage: (metrics.offTrackKPIs / metrics.totalKPIs) * 100 }
  ];

  return (
    <DashboardCard title={title} onRefresh={onRefresh}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <ScoreGauge score={metrics.overallHealth} size={120} />
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>Overall Health</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Score</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
          {kpiStatusCount.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrafficLight status={item.status} size="small" />
              <div style={{ flex: 1, fontSize: '13px' }}>{item.label}</div>
              <div style={{ fontWeight: 600 }}>{item.count}</div>
              <div style={{ width: '60px', fontSize: '12px', color: '#6b7280' }}>
                ({Math.round(item.percentage)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '16px', 
        marginBottom: '20px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '12px'
      }}>
        <div 
          onClick={() => onMetricClick?.('completion')}
          style={{ cursor: onMetricClick ? 'pointer' : 'default', textAlign: 'center' }}
        >
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
            {Math.round(metrics.completionRate)}%
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Completion Rate</div>
          <div style={{ marginTop: '4px' }}>
            <TrendIndicator trend={metrics.completionRate >= 80 ? 'up' : metrics.completionRate >= 60 ? 'stable' : 'down'} />
          </div>
        </div>
        
        <div 
          onClick={() => onMetricClick?.('engagement')}
          style={{ cursor: onMetricClick ? 'pointer' : 'default', textAlign: 'center' }}
        >
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6' }}>
            {Math.round(metrics.employeeEngagement)}%
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Employee Engagement</div>
          <div style={{ marginTop: '4px' }}>
            <TrendIndicator trend={metrics.employeeEngagement >= 75 ? 'up' : metrics.employeeEngagement >= 60 ? 'stable' : 'down'} />
          </div>
        </div>
        
        <div 
          onClick={() => onMetricClick?.('revenue')}
          style={{ cursor: onMetricClick ? 'pointer' : 'default', textAlign: 'center' }}
        >
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
            {metrics.revenueGrowth > 0 ? '+' : ''}{Math.round(metrics.revenueGrowth)}%
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Revenue Growth</div>
          <div style={{ marginTop: '4px' }}>
            <TrendIndicator trend={metrics.revenueGrowth > 0 ? 'up' : metrics.revenueGrowth < 0 ? 'down' : 'stable'} />
          </div>
        </div>
        
        <div 
          onClick={() => onMetricClick?.('satisfaction')}
          style={{ cursor: onMetricClick ? 'pointer' : 'default', textAlign: 'center' }}
        >
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
            {Math.round(metrics.customerSatisfaction)}%
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Customer Satisfaction</div>
          <div style={{ marginTop: '4px' }}>
            <TrendIndicator trend={metrics.customerSatisfaction >= 85 ? 'up' : metrics.customerSatisfaction >= 70 ? 'stable' : 'down'} />
          </div>
        </div>
      </div>

      <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#1e40af' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📊 Key Insights</span>
          <span style={{ fontSize: '11px' }}>Updated {data.last_updated ? new Date(data.last_updated).toLocaleDateString() : 'recently'}</span>
        </div>
        <ul style={{ marginTop: '8px', paddingLeft: '20px', marginBottom: 0 }}>
          {metrics.offTrackKPIs > 0 && (
            <li>{metrics.offTrackKPIs} KPIs require immediate attention</li>
          )}
          {metrics.completionRate < 80 && (
            <li>Data submission rate needs improvement ({Math.round(metrics.completionRate)}%)</li>
          )}
          {metrics.overallHealth >= 80 && (
            <li>Overall organizational health is strong</li>
          )}
        </ul>
      </div>
    </DashboardCard>
  );
};

ExecutiveScorecardWidget.propTypes = {
  data: PropTypes.shape({
    overall_health_score: PropTypes.number,
    total_kpis: PropTypes.number,
    kpi_green_count: PropTypes.number,
    kpi_yellow_count: PropTypes.number,
    kpi_red_count: PropTypes.number,
    overall_completion_rate: PropTypes.number,
    employee_engagement: PropTypes.number,
    revenue_growth: PropTypes.number,
    customer_satisfaction: PropTypes.number,
    last_updated: PropTypes.string
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onMetricClick: PropTypes.func
};