import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiBell, FiCheck, FiX, FiAlertCircle, FiClock, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const AlertList = ({ 
  alerts, 
  loading = false, 
  error = null,
  title = 'Alerts',
  onRefresh,
  onSuppress,
  onDelete,
  onEdit,
  maxItems = 10
}) => {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    
    let filtered = [...alerts];
    
    if (filter === 'active') {
      filtered = filtered.filter(a => a.is_active);
    } else if (filter === 'suppressed') {
      filtered = filtered.filter(a => !a.is_active || a.suppress_until);
    } else if (filter === 'critical') {
      filtered = filtered.filter(a => a.severity === 'critical');
    }
    
    return filtered.slice(0, maxItems);
  }, [alerts, filter, maxItems]);

  const severityColors = {
    critical: { bg: '#fef2f2', border: '#fee2e2', text: '#dc2626', icon: '#ef4444' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: '#f59e0b' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', icon: '#3b82f6' }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <FiAlertCircle size={16} />;
      case 'warning': return <FiAlertCircle size={16} />;
      default: return <FiBell size={16} />;
    }
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={4} />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load alerts" message={error} />
      </DashboardCard>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState 
          icon="🔔" 
          title="No Alerts" 
          message="No alerts have been triggered." 
        />
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
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              background: 'white'
            }}
          >
            <option value="all">All Alerts</option>
            <option value="active">Active</option>
            <option value="suppressed">Suppressed</option>
            <option value="critical">Critical Only</option>
          </select>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAlerts.map(alert => {
          const colors = severityColors[alert.severity] || severityColors.info;
          const isExpanded = expandedId === alert.id;
          
          return (
            <div
              key={alert.id}
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer'
                }}
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              >
                <div style={{ color: colors.icon }}>
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: colors.text }}>
                    {alert.alert_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {alert.message || `Alert triggered for ${alert.alert_type}`}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge status={alert.is_active !== false ? 'active' : 'inactive'} size="small" />
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {alert.last_triggered_at && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={10} />
                        {new Date(alert.last_triggered_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: colors.text }}>
                    {alert.trigger_count || 0} ×
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.5)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Configuration</div>
                    <pre style={{ fontSize: '11px', color: '#64748b', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(alert.config, null, 2)}
                    </pre>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {onSuppress && alert.is_active && (
                      <button
                        onClick={() => onSuppress(alert.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FiClock size={12} />
                        Suppress
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(alert)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '11px',
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
                        onClick={() => onDelete(alert.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #fee2e2',
                          background: 'white',
                          cursor: 'pointer',
                          fontSize: '11px',
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
      
      {alerts.length > maxItems && (
        <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </span>
        </div>
      )}
    </DashboardCard>
  );
};

AlertList.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    alert_type: PropTypes.string,
    severity: PropTypes.string,
    message: PropTypes.string,
    is_active: PropTypes.bool,
    last_triggered_at: PropTypes.string,
    trigger_count: PropTypes.number,
    config: PropTypes.object,
    suppress_until: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onSuppress: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  maxItems: PropTypes.number
};