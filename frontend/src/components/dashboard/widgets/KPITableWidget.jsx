import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { TrendIndicator } from '../common/TrendIndicator';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const KPITableWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'KPI Performance',
  onRefresh,
  onExport,
  onKpiClick,
  showTrend = true,
  compact = false
}) => {
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    if (!data || !data.length) return [];
    
    let filtered = data;
    if (searchTerm) {
      filtered = data.filter(kpi => 
        kpi.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kpi.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'score':
          aVal = a.current_score ?? 0;
          bVal = b.current_score ?? 0;
          break;
        case 'status':
          const statusOrder = { green: 3, yellow: 2, red: 1 };
          aVal = statusOrder[a.status] || 0;
          bVal = statusOrder[b.status] || 0;
          break;
        case 'actual':
          aVal = a.actual_value ?? 0;
          bVal = b.actual_value ?? 0;
          break;
        case 'target':
          aVal = a.target_value ?? 0;
          bVal = b.target_value ?? 0;
          break;
        default:
          aVal = a[sortField] || '';
          bVal = b[sortField] || '';
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [data, sortField, sortDirection, searchTerm]);

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState 
          title="Failed to load KPI data"
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
          title="No KPIs Found"
          message="There are no KPIs to display at this time."
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title={title} 
      onRefresh={onRefresh} 
      onExport={onExport}
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search KPIs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              width: '200px'
            }}
          />
        </div>
      }
    >
      <div className="kpi-table-wrapper" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <th 
                onClick={() => handleSort('name')}
                style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }}
              >
                Performance Indicator {getSortIcon('name')}
              </th>
              <th 
                onClick={() => handleSort('category')}
                style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }}
              >
                Category {getSortIcon('category')}
              </th>
              <th 
                onClick={() => handleSort('score')}
                style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }}
              >
                Score {getSortIcon('score')}
              </th>
              <th 
                onClick={() => handleSort('status')}
                style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }}
              >
                Status {getSortIcon('status')}
              </th>
              {!compact && (
                <>
                  <th 
                    onClick={() => handleSort('actual')}
                    style={{ padding: '12px', textAlign: 'right', cursor: 'pointer' }}
                  >
                    Actual {getSortIcon('actual')}
                  </th>
                  <th 
                    onClick={() => handleSort('target')}
                    style={{ padding: '12px', textAlign: 'right', cursor: 'pointer' }}
                  >
                    Target {getSortIcon('target')}
                  </th>
                  {showTrend && (
                    <th style={{ padding: '12px', textAlign: 'center' }}>Trend</th>
                  )}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.map((kpi) => (
              <tr 
                key={kpi.id}
                onClick={() => onKpiClick?.(kpi.id)}
                style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  cursor: onKpiClick ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px', fontWeight: 500 }}>{kpi.name}</td>
                <td style={{ padding: '12px', color: '#6b7280' }}>{kpi.category || '—'}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                  {kpi.current_score !== undefined ? `${Math.round(kpi.current_score)}%` : '—'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <TrafficLight status={kpi.status} size="small" />
                </td>
                {!compact && (
                  <>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {kpi.actual_value !== undefined ? kpi.actual_value : '—'} {kpi.unit || ''}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {kpi.target_value !== undefined ? kpi.target_value : '—'} {kpi.unit || ''}
                    </td>
                    {showTrend && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {kpi.trend && <TrendIndicator trend={kpi.trend} size="small" />}
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280' }}>
        Showing {filteredAndSortedData.length} of {data.length} KPIs
      </div>
    </DashboardCard>
  );
};

KPITableWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string,
    current_score: PropTypes.number,
    status: PropTypes.oneOf(['green', 'yellow', 'red']),
    actual_value: PropTypes.number,
    target_value: PropTypes.number,
    unit: PropTypes.string,
    trend: PropTypes.oneOf(['up', 'down', 'stable'])
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  onKpiClick: PropTypes.func,
  showTrend: PropTypes.bool,
  compact: PropTypes.bool
};