// frontend/src/components/dashboard/comparisons/ComparisonResultsTable.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const ComparisonResultsTable = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'KPI Comparison Details',
  onRefresh,
  onKpiClick
}) => {
  const kpiData = useMemo(() => {
    if (!data || !data.kpis) return [];
    return data.kpis.map(kpi => ({
      ...kpi,
      variance: kpi.current_score - kpi.previous_score,
      variancePercent: ((kpi.current_score - kpi.previous_score) / (kpi.previous_score || 1)) * 100
    }));
  }, [data]);

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load comparison details" message={error} />
      </DashboardCard>
    );
  }

  if (!data || !data.kpis || data.kpis.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState 
          icon="📊" 
          title="No KPI Data" 
          message="No KPI data available for this comparison." 
        />
      </DashboardCard>
    );
  }

  const getVarianceIcon = (variance) => {
    if (variance > 0) return <FiTrendingUp size={12} color="#10b981" />;
    if (variance < 0) return <FiTrendingDown size={12} color="#ef4444" />;
    return <FiMinus size={12} color="#6b7280" />;
  };

  const getVarianceColor = (variance) => {
    if (variance > 0) return '#10b981';
    if (variance < 0) return '#ef4444';
    return '#6b7280';
  };

  const summary = {
    improved: kpiData.filter(k => k.variance > 0).length,
    declined: kpiData.filter(k => k.variance < 0).length,
    unchanged: kpiData.filter(k => k.variance === 0).length,
    avgVariance: kpiData.reduce((sum, k) => sum + k.variance, 0) / kpiData.length
  };

  return (
    <DashboardCard 
      title={title} 
      onRefresh={onRefresh}
      actions={
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <span style={{ color: '#10b981' }}>↑ {summary.improved} improved</span>
          <span style={{ color: '#ef4444' }}>↓ {summary.declined} declined</span>
          <span style={{ color: '#6b7280' }}>→ {summary.unchanged} unchanged</span>
        </div>
      }
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>KPI Name</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Previous</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Current</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Change</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {kpiData.map((kpi) => (
              <tr 
                key={kpi.id}
                onClick={() => onKpiClick?.(kpi.id)}
                style={{ 
                  borderBottom: '1px solid #e2e8f0',
                  cursor: onKpiClick ? 'pointer' : 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px', fontWeight: 500 }}>{kpi.name}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div>{Math.round(kpi.previous_score)}%</div>
                  <TrafficLight status={kpi.previous_score >= 90 ? 'green' : kpi.previous_score >= 50 ? 'yellow' : 'red'} size="small" />
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 600 }}>{Math.round(kpi.current_score)}%</div>
                  <TrafficLight status={kpi.current_score >= 90 ? 'green' : kpi.current_score >= 50 ? 'yellow' : 'red'} size="small" />
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: getVarianceColor(kpi.variance) }}>
                    {getVarianceIcon(kpi.variance)}
                    <span>
                      {kpi.variance > 0 ? '+' : ''}{kpi.variance.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    background: kpi.variance > 5 ? '#dcfce7' : kpi.variance < -5 ? '#fee2e2' : '#f1f5f9',
                    color: kpi.variance > 5 ? '#166534' : kpi.variance < -5 ? '#991b1b' : '#475569'
                  }}>
                    {kpi.variance > 5 ? 'Improving' : kpi.variance < -5 ? 'Declining' : 'Stable'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: '#f8fafc', 
        borderRadius: '8px',
        fontSize: '12px',
        color: '#64748b',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Average variance: {summary.avgVariance > 0 ? '+' : ''}{summary.avgVariance.toFixed(1)}%</span>
        <span>{kpiData.length} KPIs analyzed</span>
      </div>
    </DashboardCard>
  );
};

ComparisonResultsTable.propTypes = {
  data: PropTypes.shape({
    kpis: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      current_score: PropTypes.number,
      previous_score: PropTypes.number
    }))
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onKpiClick: PropTypes.func
};