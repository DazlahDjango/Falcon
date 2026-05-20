import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const PendingApprovalsWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Pending Approvals',
  onRefresh,
  onApprove,
  onReject,
  onViewDetails,
  maxItems = 5
}) => {
  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (item) => {
    setProcessingId(item.id);
    try {
      await onApprove?.(item);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item) => {
    setProcessingId(item.id);
    try {
      await onReject?.(item);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={3} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load approvals" message={error} />
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState 
          icon="✅" 
          title="No Pending Approvals" 
          message="All submissions have been reviewed." 
        />
      </DashboardCard>
    );
  }

  const approvalsToShow = data.slice(0, maxItems);

  return (
    <DashboardCard title={title} onRefresh={onRefresh}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {approvalsToShow.map((item) => (
          <div 
            key={item.id}
            style={{
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{item.kpi_name || item.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  Submitted by: {item.user_name || item.submitted_by}
                </div>
              </div>
              <StatusBadge status="pending" size="small" />
            </div>
            
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              Value: <strong>{item.actual_value} {item.unit || ''}</strong> 
              {item.target_value && ` (Target: ${item.target_value})`}
            </div>
            
            {item.comments && (
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', fontStyle: 'italic' }}>
                "{item.comments}"
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleReject(item)}
                disabled={processingId === item.id}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ef4444',
                  background: 'white',
                  color: '#ef4444',
                  cursor: processingId === item.id ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(item)}
                disabled={processingId === item.id}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#10b981',
                  color: 'white',
                  cursor: processingId === item.id ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                {processingId === item.id ? 'Processing...' : 'Approve'}
              </button>
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(item)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Details
                </button>
              )}
            </div>
          </div>
        ))}
        
        {data.length > maxItems && (
          <div style={{ textAlign: 'center', paddingTop: '8px' }}>
            <button 
              onClick={() => onViewDetails?.('view_all')}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3b82f6', 
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              + {data.length - maxItems} more pending
            </button>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

PendingApprovalsWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    kpi_name: PropTypes.string,
    title: PropTypes.string,
    user_name: PropTypes.string,
    submitted_by: PropTypes.string,
    actual_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    target_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unit: PropTypes.string,
    comments: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onViewDetails: PropTypes.func,
  maxItems: PropTypes.number
};