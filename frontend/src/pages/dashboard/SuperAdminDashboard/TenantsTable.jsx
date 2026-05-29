import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, StatusBadge, LoadingSkeleton } from '../../../components/dashboard/common';
import { TenantDetailModal } from './TenantDetailModal';

export const TenantsTable = ({ data, loading, onRefresh, onTenantClick, onRefreshTenant }) => {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleTenantClick = (tenant) => {
    setSelectedTenant(tenant);
    setShowModal(true);
    onTenantClick?.(tenant);
  };

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title="Tenants">
        <div className="empty-state">No tenants available</div>
      </DashboardCard>
    );
  }

  const getHealthColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <>
      <DashboardCard title="All Tenants" onRefresh={onRefresh}>
        <div className="tenants-table-wrapper">
          <table className="tenants-table">
            <thead>
              <tr>
                <th>Tenant Name</th>
                <th>Status</th>
                <th>Users</th>
                <th>KPIs</th>
                <th>Health</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tenant) => (
                <tr key={tenant.client_id}>
                  <td className="tenant-name">{tenant.client_name}</td>
                  <td>
                    <StatusBadge
                      status={tenant.subscription_status === 'active' ? 'active' : 'inactive'}
                      text={tenant.subscription_status}
                    />
                  </td>
                  <td>{tenant.total_users || 0}</td>
                  <td>{tenant.total_kpis || 0}</td>
                  <td>
                    <div className="health-score">
                      <div
                        className="health-bar"
                        style={{
                          width: `${tenant.health_score || 0}%`,
                          background: getHealthColor(tenant.health_score || 0)
                        }}
                      />
                      <span>{Math.round(tenant.health_score || 0)}%</span>
                    </div>
                  </td>
                  <td className={tenant.days_until_expiry <= 7 ? 'expiring-soon' : ''}>
                    {tenant.days_until_expiry ? `${tenant.days_until_expiry} days` : '—'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleTenantClick(tenant)}
                      className="view-details-btn"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <TenantDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        tenant={selectedTenant}
        onRefreshTenant={onRefreshTenant}
      />
    </>
  );
};

TenantsTable.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  onRefresh: PropTypes.func,
  onTenantClick: PropTypes.func,
  onRefreshTenant: PropTypes.func
};
export default TenantsTable;