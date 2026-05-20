import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiCalendar, FiClock, FiTrash2, FiEdit2, FiPlay, FiDownload, FiFileText, FiFile, FiFilePlus } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const ExportScheduleList = ({ 
  exports, 
  loading = false, 
  error = null,
  title = 'Scheduled Exports',
  onRefresh,
  onEdit,
  onDelete,
  onTrigger,
  onDownload,
  onAdd
}) => {
  const [expandedId, setExpandedId] = useState(null);

  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf': return <FiFileText size={14} />;
      case 'excel': return <FiFile size={14} />;
      case 'csv': return <FiFilePlus size={14} />;
      default: return <FiFile size={14} />;
    }
  };

  const getScheduleLabel = (scheduleType) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly'
    };
    return labels[scheduleType] || scheduleType;
  };

  const getNextRunText = (nextRunAt) => {
    if (!nextRunAt) return 'Not scheduled';
    const next = new Date(nextRunAt);
    const now = new Date();
    const diffDays = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={3} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load exports" message={error} />
      </DashboardCard>
    );
  }

  if (!exports || exports.length === 0) {
    return (
      <DashboardCard 
        title={title} 
        onRefresh={onRefresh}
        actions={
          onAdd && (
            <button
              onClick={onAdd}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FiPlay size={12} />
              New Schedule
            </button>
          )
        }
      >
        <EmptyState 
          icon="📅" 
          title="No Scheduled Exports" 
          message="Create a schedule to automatically export dashboard reports." 
          actionLabel="Create Schedule"
          onAction={onAdd}
        />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title={title} 
      onRefresh={onRefresh}
      actions={
        onAdd && (
          <button
            onClick={onAdd}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FiPlay size={12} />
            New Schedule
          </button>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {exports.map(exportItem => {
          const isExpanded = expandedId === exportItem.id;
          
          return (
            <div
              key={exportItem.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                overflow: 'hidden',
                background: 'white'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: isExpanded ? '#f8fafc' : 'white'
                }}
                onClick={() => setExpandedId(isExpanded ? null : exportItem.id)}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6'
                }}>
                  {getFormatIcon(exportItem.format)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>
                    {exportItem.name || `${exportItem.dashboard_type} Export`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span>{getScheduleLabel(exportItem.schedule_type)}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiCalendar size={10} />
                      {getNextRunText(exportItem.next_run_at)}
                    </span>
                    {exportItem.last_run_status && (
                      <>
                        <span>•</span>
                        <StatusBadge 
                          status={exportItem.last_run_status === 'success' ? 'active' : 'inactive'} 
                          text={exportItem.last_run_status}
                          size="small"
                        />
                      </>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge status={exportItem.is_active ? 'active' : 'inactive'} size="small" />
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {exportItem.last_run_at && new Date(exportItem.last_run_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#fafafa' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Recipients</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {exportItem.recipients?.map(email => (
                        <span key={email} style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          background: '#e2e8f0',
                          borderRadius: '12px',
                          color: '#475569'
                        }}>
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {exportItem.filters && Object.keys(exportItem.filters).length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Filters</div>
                      <pre style={{ fontSize: '10px', background: '#f1f5f9', padding: '8px', borderRadius: '6px', margin: 0, overflow: 'auto' }}>
                        {JSON.stringify(exportItem.filters, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                    {onDownload && exportItem.last_run_status === 'success' && (
                      <button
                        onClick={() => onDownload(exportItem.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FiDownload size={12} />
                        Download
                      </button>
                    )}
                    {onTrigger && (
                      <button
                        onClick={() => onTrigger(exportItem.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FiPlay size={12} />
                        Run Now
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(exportItem)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FiEdit2 size={12} />
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(exportItem.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #fee2e2',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#dc2626'
                        }}
                      >
                        <FiTrash2 size={12} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

ExportScheduleList.propTypes = {
  exports: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    dashboard_type: PropTypes.string,
    format: PropTypes.string,
    schedule_type: PropTypes.string,
    recipients: PropTypes.array,
    filters: PropTypes.object,
    is_active: PropTypes.bool,
    next_run_at: PropTypes.string,
    last_run_at: PropTypes.string,
    last_run_status: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onTrigger: PropTypes.func,
  onDownload: PropTypes.func,
  onAdd: PropTypes.func
};