import React from 'react';
import PropTypes from 'prop-types';
import { FiDownload, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const ExportHistory = ({ 
  history, 
  loading = false, 
  error = null,
  title = 'Export History',
  onRefresh,
  onDownload,
  maxItems = 10
}) => {
  const getStatusIcon = (status) => {
    if (status === 'success') return <FiCheckCircle size={14} color="#10b981" />;
    if (status === 'failed') return <FiXCircle size={14} color="#ef4444" />;
    return <FiClock size={14} color="#f59e0b" />;
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getFormatBadge = (format) => {
    const badges = {
      pdf: { bg: '#fee2e2', color: '#dc2626', label: 'PDF' },
      excel: { bg: '#d1fae5', color: '#059669', label: 'Excel' },
      csv: { bg: '#dbeafe', color: '#2563eb', label: 'CSV' }
    };
    const badge = badges[format] || badges.pdf;
    return (
      <span style={{
        fontSize: '10px',
        padding: '2px 6px',
        borderRadius: '4px',
        background: badge.bg,
        color: badge.color
      }}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={5} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load history" message={error} />
      </DashboardCard>
    );
  }

  if (!history || history.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState 
          icon="📄" 
          title="No Export History" 
          message="Exported reports will appear here." 
        />
      </DashboardCard>
    );
  }

  const historyToShow = history.slice(0, maxItems);

  return (
    <DashboardCard title={title} onRefresh={onRefresh}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {historyToShow.map((item, index) => (
          <div
            key={item.id || index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: item.status === 'success' ? '#f8fafc' : '#fef2f2',
              borderRadius: '8px',
              border: `1px solid ${item.status === 'success' ? '#e2e8f0' : '#fee2e2'}`
            }}
          >
            <div>
              {getStatusIcon(item.status)}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500 }}>
                  {item.name || `${item.dashboard_type} Export`}
                </span>
                {getFormatBadge(item.format)}
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {getRelativeTime(item.created_at)}
                </span>
              </div>
              {item.error_message && (
                <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                  {item.error_message}
                </div>
              )}
              {item.file_size && (
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  {(item.file_size / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
            
            {item.status === 'success' && onDownload && (
              <button
                onClick={() => onDownload(item.id)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <FiDownload size={12} />
                Download
              </button>
            )}
            
            {item.status === 'pending' && (
              <span style={{ fontSize: '11px', color: '#f59e0b' }}>Processing...</span>
            )}
          </div>
        ))}
      </div>
      
      {history.length > maxItems && (
        <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {historyToShow.length} of {history.length} exports
          </span>
        </div>
      )}
    </DashboardCard>
  );
};

ExportHistory.propTypes = {
  history: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    dashboard_type: PropTypes.string,
    format: PropTypes.string,
    status: PropTypes.string,
    created_at: PropTypes.string,
    file_size: PropTypes.number,
    error_message: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onDownload: PropTypes.func,
  maxItems: PropTypes.number
};