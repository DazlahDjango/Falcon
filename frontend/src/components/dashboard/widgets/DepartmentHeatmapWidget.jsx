import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const DepartmentHeatmapWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Department Performance Heatmap',
  onRefresh,
  onExport,
  onDepartmentClick
}) => {
  const [sortBy, setSortBy] = useState('score');
  const [filterStatus, setFilterStatus] = useState('all');

  const sortedData = useMemo(() => {
    if (!data || !data.length) return [];
    
    let filtered = data;
    if (filterStatus !== 'all') {
      filtered = data.filter(dept => dept.status === filterStatus);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'score') return (b.average_score || 0) - (a.average_score || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'employees') return (b.employee_count || 0) - (a.employee_count || 0);
      return 0;
    });
  }, [data, sortBy, filterStatus]);

  const getHeatmapColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#6ee7b7';
    if (score >= 50) return '#fcd34d';
    if (score >= 30) return '#fbbf24';
    return '#ef4444';
  };

  const stats = useMemo(() => {
    if (!data || !data.length) return { avgScore: 0, aboveTarget: 0, total: 0 };
    const avgScore = data.reduce((sum, d) => sum + (d.average_score || 0), 0) / data.length;
    const aboveTarget = data.filter(d => (d.average_score || 0) >= 90).length;
    return { avgScore: Math.round(avgScore), aboveTarget, total: data.length };
  }, [data]);

  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load department data" message={error} />
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Department Data" message="No department performance data available." />
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
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="employees">Sort by Size</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
          >
            <option value="all">All Status</option>
            <option value="green">On Track</option>
            <option value="yellow">At Risk</option>
            <option value="red">Off Track</option>
          </select>
        </div>
      }
    >
      <div style={{ marginBottom: '16px', display: 'flex', gap: '24px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Average Score</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: getHeatmapColor(stats.avgScore) }}>{stats.avgScore}%</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Departments on Track</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.aboveTarget}/{stats.total}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sortedData.map(dept => (
          <div 
            key={dept.id}
            onClick={() => onDepartmentClick?.(dept.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              cursor: onDepartmentClick ? 'pointer' : 'default',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            <div style={{ flex: 2 }}>
              <div style={{ fontWeight: 500 }}>{dept.name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{dept.employee_count || 0} employees</div>
            </div>
            
            <div style={{ flex: 3 }}>
              <div style={{ 
                background: '#e5e7eb', 
                borderRadius: '10px', 
                height: '8px', 
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${dept.average_score || 0}%`, 
                  height: '100%', 
                  background: getHeatmapColor(dept.average_score || 0),
                  borderRadius: '10px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                Score: {Math.round(dept.average_score || 0)}%
              </div>
            </div>
            
            <div style={{ textAlign: 'right', minWidth: '100px' }}>
              <TrafficLight status={dept.status} showLabel />
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

DepartmentHeatmapWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    average_score: PropTypes.number,
    status: PropTypes.oneOf(['green', 'yellow', 'red']),
    employee_count: PropTypes.number
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  onDepartmentClick: PropTypes.func
};