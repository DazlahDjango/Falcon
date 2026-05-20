import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const TeamPerformanceWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Team Performance',
  onRefresh,
  onMemberClick,
  showAggregate = true
}) => {
  const [sortBy, setSortBy] = useState('score');
  const [filterStatus, setFilterStatus] = useState('all');

  const aggregate = useMemo(() => {
    if (!data || !data.length) return null;
    
    const total = data.length;
    const greenCount = data.filter(m => m.traffic_light === 'green').length;
    const yellowCount = data.filter(m => m.traffic_light === 'yellow').length;
    const redCount = data.filter(m => m.traffic_light === 'red').length;
    const avgScore = data.reduce((sum, m) => sum + (m.aggregated_score || 0), 0) / total;
    
    return {
      total,
      greenCount,
      yellowCount,
      redCount,
      avgScore: Math.round(avgScore),
      greenPercentage: (greenCount / total) * 100,
      redPercentage: (redCount / total) * 100
    };
  }, [data]);

  const sortedData = useMemo(() => {
    if (!data || !data.length) return [];
    
    let filtered = data;
    if (filterStatus !== 'all') {
      filtered = data.filter(member => member.traffic_light === filterStatus);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'score') return (b.aggregated_score || 0) - (a.aggregated_score || 0);
      if (sortBy === 'name') return (a.first_name || '').localeCompare(b.first_name || '');
      if (sortBy === 'reports') return (b.direct_report_count || 0) - (a.direct_report_count || 0);
      return 0;
    });
  }, [data, sortBy, filterStatus]);

  if (loading) {
    return <LoadingSkeleton type="list" count={5} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load team data" message={error} />
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Team Members" message="No team members found." />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title={title} 
      onRefresh={onRefresh}
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px' }}
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="reports">Sort by Reports</option>
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
      {showAggregate && aggregate && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px', 
          marginBottom: '20px',
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '10px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{aggregate.total}</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Members</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{aggregate.avgScore}%</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Avg Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 500 }}>🟢{aggregate.greenCount}</span>
              <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 500 }}>🟡{aggregate.yellowCount}</span>
              <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: 500 }}>🔴{aggregate.redCount}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Status</div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
        {sortedData.map((member) => (
          <div 
            key={member.id}
            onClick={() => onMemberClick?.(member.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              cursor: onMemberClick ? 'pointer' : 'default',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: member.traffic_light === 'green' ? '#d1fae5' : 
                         member.traffic_light === 'yellow' ? '#fed7aa' : '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {member.first_name?.[0] || member.email?.[0]?.toUpperCase() || 'U'}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>
                {member.first_name} {member.last_name}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {member.title || member.role || 'Staff'} • {member.department || 'No Department'}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, minWidth: '45px', textAlign: 'right' }}>
                {member.aggregated_score !== undefined ? `${Math.round(member.aggregated_score)}%` : '—'}
              </div>
              <TrafficLight status={member.traffic_light} size="medium" />
              {member.direct_report_count > 0 && (
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  background: '#f3f4f6',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  👥 {member.direct_report_count}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {sortedData.length === 0 && filterStatus !== 'all' && (
        <EmptyState 
          title={`No ${filterStatus} status members`} 
          message={`No team members with ${filterStatus} status found.`}
        />
      )}
    </DashboardCard>
  );
};

TeamPerformanceWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    title: PropTypes.string,
    role: PropTypes.string,
    department: PropTypes.string,
    traffic_light: PropTypes.oneOf(['green', 'yellow', 'red']),
    aggregated_score: PropTypes.number,
    direct_report_count: PropTypes.number
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onMemberClick: PropTypes.func,
  showAggregate: PropTypes.bool
};