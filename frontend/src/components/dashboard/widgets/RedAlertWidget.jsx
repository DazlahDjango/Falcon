import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const RedAlertWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Critical Alerts',
  onRefresh,
  onAlertClick,
  maxItems = 5
}) => {
  if (loading) {
    return <LoadingSkeleton type="list" count={3} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load alerts" message={error} />
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState 
          icon="✅" 
          title="No Critical Alerts" 
          message="All KPIs are performing within acceptable ranges." 
        />
      </DashboardCard>
    );
  }

  const alertsToShow = data.slice(0, maxItems);

  return (
    <DashboardCard title={title} onRefresh={onRefresh}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alertsToShow.map((alert, index) => (
          <div 
            key={alert.id || index}
            onClick={() => onAlertClick?.(alert)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              cursor: onAlertClick ? 'pointer' : 'default'
            }}
          >
            <TrafficLight status="red" size="medium" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: '#991b1b' }}>{alert.kpi_name || alert.title}</div>
              <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '2px' }}>
                {alert.message || `${alert.kpi_name} is below target (${alert.current_score}%)`}
              </div>
              {alert.department && (
                <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px' }}>
                  Department: {alert.department}
                </div>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#dc2626', whiteSpace: 'nowrap' }}>
              {alert.days_red ? `${alert.days_red} days` : 'Critical'}
            </div>
          </div>
        ))}
        
        {data.length > maxItems && (
          <div style={{ textAlign: 'center', paddingTop: '8px' }}>
            <button 
              onClick={() => onAlertClick?.('view_all')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3b82f6', 
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              + {data.length - maxItems} more alerts
            </button>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

RedAlertWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    kpi_name: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
    current_score: PropTypes.number,
    department: PropTypes.string,
    days_red: PropTypes.number
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onAlertClick: PropTypes.func,
  maxItems: PropTypes.number
};