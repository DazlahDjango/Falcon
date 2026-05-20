import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const MissingDataWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Missing Data Alerts',
  onRefresh,
  onNotifyUser,
  maxItems = 5
}) => {
  if (loading) {
    return <LoadingSkeleton type="list" count={3} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load missing data" message={error} />
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState 
          icon="✅" 
          title="Complete Data" 
          message="All data entries are up to date." 
        />
      </DashboardCard>
    );
  }

  const missingToShow = data.slice(0, maxItems);

  return (
    <DashboardCard title={title} onRefresh={onRefresh}>
      <div style={{ marginBottom: '12px', padding: '8px', background: '#fef3c7', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
        ⚠️ {data.length} entries missing for the current period
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {missingToShow.map((item, index) => (
          <div 
            key={item.id || index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px',
              background: '#fffbeb',
              borderRadius: '6px',
              border: '1px solid #fde68a'
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: '13px' }}>{item.kpi_name || item.title}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                {item.user_name || item.owner} • Due: {item.due_date || 'End of month'}
              </div>
            </div>
            {onNotifyUser && (
              <button
                onClick={() => onNotifyUser(item)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Remind
              </button>
            )}
          </div>
        ))}
        
        {data.length > maxItems && (
          <div style={{ textAlign: 'center', paddingTop: '8px' }}>
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3b82f6', 
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              + {data.length - maxItems} more
            </button>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

MissingDataWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    kpi_name: PropTypes.string,
    title: PropTypes.string,
    user_name: PropTypes.string,
    owner: PropTypes.string,
    due_date: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onNotifyUser: PropTypes.func,
  maxItems: PropTypes.number
};