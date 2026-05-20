// frontend/src/components/dashboard/widgets/TenantSummaryWidget.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { TrafficLight } from '../common/TrafficLight';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const TenantSummaryWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Tenant Overview',
  onRefresh,
  onTenantClick,
  maxItems = 5
}) => {
  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load tenant data" message={error} />
      </DashboardCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Tenant Data" message="No tenant information available." />
      </DashboardCard>
    );
  }

  const getHealthColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const tenantsToShow = data.slice(0, maxItems);

  return (
    <DashboardCard title={title} onRefresh={onRefresh}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Tenant</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Users</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Health</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {tenantsToShow.map((tenant) => (
              <tr 
                key={tenant.client_id}
                onClick={() => onTenantClick?.(tenant.client_id)}
                style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  cursor: onTenantClick ? 'pointer' : 'default'
                }}
              >
                <td style={{ padding: '10px', fontWeight: 500 }}>{tenant.client_name}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    background: tenant.subscription_status === 'active' ? '#d1fae5' : '#fee2e2',
                    color: tenant.subscription_status === 'active' ? '#065f46' : '#991b1b'
                  }}>
                    {tenant.subscription_status}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{tenant.total_users || 0}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '60px', 
                      background: '#e5e7eb', 
                      borderRadius: '10px', 
                      height: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${tenant.health_score || 0}%`, 
                        height: '100%', 
                        background: getHealthColor(tenant.health_score || 0),
                        borderRadius: '10px'
                      }} />
                    </div>
                    <span style={{ fontSize: '12px' }}>{Math.round(tenant.health_score || 0)}%</span>
                  </div>
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
                  {tenant.days_until_expiry !== undefined 
                    ? (tenant.days_until_expiry <= 0 ? 'Expired' : `${tenant.days_until_expiry} days`)
                    : '—'}
                </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length > maxItems && (
        <div style={{ textAlign: 'center', paddingTop: '12px' }}>
          <button 
            onClick={() => onTenantClick?.('view_all')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#3b82f6', 
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            View all {data.length} tenants →
          </button>
        </div>
      )}
    </DashboardCard>
  );
};

TenantSummaryWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    client_id: PropTypes.string,
    client_name: PropTypes.string,
    subscription_status: PropTypes.string,
    total_users: PropTypes.number,
    health_score: PropTypes.number,
    days_until_expiry: PropTypes.number
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onTenantClick: PropTypes.func,
  maxItems: PropTypes.number
};