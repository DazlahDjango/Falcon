import React from 'react';
import PropTypes from 'prop-types';
import { FiUser, FiArrowRight } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const ReportingChainView = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Reporting Chain',
  currentUserId = null,
  onRefresh,
  onUserClick
}) => {
  if (loading) {
    return <LoadingSkeleton type="list" count={4} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load reporting chain" message={error} />
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Reporting Chain" message="No reporting chain information available." />
      </DashboardCard>
    );
  }

  const isCurrentUser = (userId) => {
    return currentUserId && String(userId) === String(currentUserId);
  };

  return (
    <DashboardCard title={title} onRefresh={onRefresh}>
      <div style={{ padding: '8px 0' }}>
        {data.map((manager, index) => {
          const isLast = index === data.length - 1;
          
          return (
            <div key={manager.id}>
              <div 
                onClick={() => onUserClick?.(manager.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: isCurrentUser(manager.id) ? '#eff6ff' : 'white',
                  borderRadius: '10px',
                  border: isCurrentUser(manager.id) ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                  cursor: onUserClick ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = isCurrentUser(manager.id) ? '#eff6ff' : 'white'}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: manager.traffic_light === 'green' ? '#dcfce7' : 
                             manager.traffic_light === 'yellow' ? '#fef3c7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiUser size={24} color={manager.traffic_light === 'green' ? '#166534' : 
                                            manager.traffic_light === 'yellow' ? '#92400e' : '#991b1b'} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {manager.first_name} {manager.last_name}
                    {isCurrentUser(manager.id) && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '12px'
                      }}>
                        You
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {manager.title || manager.role || 'Manager'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {manager.aggregated_score !== undefined && (
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: manager.traffic_light === 'green' ? '#10b981' :
                             manager.traffic_light === 'yellow' ? '#f59e0b' : '#ef4444'
                    }}>
                      {Math.round(manager.aggregated_score)}%
                    </div>
                  )}
                  <TrafficLight status={manager.traffic_light} size="medium" />
                </div>
              </div>
              
              {!isLast && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  padding: '4px 0',
                  color: '#94a3b8'
                }}>
                  <FiArrowRight size={16} style={{ transform: 'rotate(90deg)' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: '#f8fafc', 
        borderRadius: '8px',
        fontSize: '12px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>📊</span>
        <span>This chain shows {data.length} level{data.length > 1 ? 's' : ''} of management above you.</span>
      </div>
    </DashboardCard>
  );
};

ReportingChainView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    title: PropTypes.string,
    role: PropTypes.string,
    traffic_light: PropTypes.string,
    aggregated_score: PropTypes.number
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRefresh: PropTypes.func,
  onUserClick: PropTypes.func
};