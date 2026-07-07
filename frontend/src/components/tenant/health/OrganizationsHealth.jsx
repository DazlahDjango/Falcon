// components/tenant/health/OrganizationsHealth.jsx
import React, { useState } from 'react';
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { useHealth } from '../../../hooks/tenant';

const OrganizationsHealth = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const {
    organizationsHealth,
    loading,
    error,
    lastChecked,
    list,
    total,
    healthyCount,
    unhealthyCount,
    fetchHealth,
    clearAllErrors,
  } = useOrganizationsHealth({ autoFetch: true, refreshInterval: 120000 });

  const handleRefresh = () => {
    fetchHealth();
  };

  const filteredOrgs = list?.filter(org => {
    const matchesSearch = org.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.organization_id?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'healthy') return matchesSearch && org.status === 'healthy';
    if (filter === 'unhealthy') return matchesSearch && org.status === 'unhealthy';
    return matchesSearch;
  }) || [];

  if (error) {
    return (
      <div className="health-container">
        <div className="health-card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>Error loading organizations health</p>
          <p className="health-text-sm health-text-muted">{typeof error === 'string' ? error : 'Something went wrong'}</p>
          <button className="health-btn health-btn-primary health-mt-4" onClick={clearAllErrors}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="health-container">
      <div className="health-header">
        <div>
          <h1 className="health-title">Organizations Health</h1>
          <p className="health-subtitle">
            {total} organizations • {healthyCount} healthy • {unhealthyCount} unhealthy
            {lastChecked && ` • Last checked: ${new Date(lastChecked).toLocaleString()}`}
          </p>
        </div>
        <div className="health-flex health-gap-3">
          <button className="health-btn health-btn-secondary" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'health-loading-spinner' : ''} style={loading ? { width: '16px', height: '16px', borderWidth: '2px' } : {}} />
            {!loading && 'Refresh'}
          </button>
        </div>
      </div>

      <div className="health-grid health-grid-cols-3 health-mb-6">
        <div className="health-stat-card" style={{ textAlign: 'center' }}>
          <p className="health-stat-value" style={{ color: '#3b82f6' }}>{total || 0}</p>
          <p className="health-stat-label">Total Organizations</p>
        </div>
        <div className="health-stat-card" style={{ textAlign: 'center' }}>
          <p className="health-stat-value" style={{ color: '#22c55e' }}>{healthyCount || 0}</p>
          <p className="health-stat-label">Healthy</p>
        </div>
        <div className="health-stat-card" style={{ textAlign: 'center' }}>
          <p className="health-stat-value" style={{ color: '#ef4444' }}>{unhealthyCount || 0}</p>
          <p className="health-stat-label">Unhealthy</p>
        </div>
      </div>

      <div className="health-card health-mb-6">
        <div className="health-flex health-gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="health-flex health-gap-2" style={{ flex: 1, minWidth: '200px' }}>
            <FiSearch size={16} style={{ color: '#94a3b8', position: 'absolute', marginTop: '10px', marginLeft: '10px' }} />
            <input
              type="text"
              className="health-input"
              style={{ paddingLeft: '32px' }}
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="health-flex health-gap-2">
            <button
              className={`health-btn health-btn-sm ${filter === 'all' ? 'health-btn-primary' : 'health-btn-secondary'}`}
              onClick={() => setFilter('all')}
              disabled={loading}
            >
              All
            </button>
            <button
              className={`health-btn health-btn-sm ${filter === 'healthy' ? 'health-btn-success' : 'health-btn-secondary'}`}
              onClick={() => setFilter('healthy')}
              disabled={loading}
            >
              <FiCheckCircle size={12} style={{ marginRight: '4px' }} />
              Healthy
            </button>
            <button
              className={`health-btn health-btn-sm ${filter === 'unhealthy' ? 'health-btn-danger' : 'health-btn-secondary'}`}
              onClick={() => setFilter('unhealthy')}
              disabled={loading}
            >
              <FiXCircle size={12} style={{ marginRight: '4px' }} />
              Unhealthy
            </button>
          </div>
        </div>
      </div>

      {loading && !list?.length ? (
        <div className="health-loading">
          <div className="health-loading-spinner"></div>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="health-empty-state">
          <div className="health-empty-icon">🏥</div>
          <p className="health-empty-title">No organizations found</p>
          <p className="health-empty-desc">{searchTerm ? 'Try adjusting your search' : 'No organizations to display'}</p>
        </div>
      ) : (
        <div className="health-card" style={{ overflowX: 'auto' }}>
          <table className="health-table">
            <thead className="health-table-head">
              <tr>
                <th>Organization</th>
                <th>ID</th>
                <th>Status</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody className="health-table-body">
              {filteredOrgs.map((org) => (
                <tr key={org.organization_id}>
                  <td>
                    <div className="health-font-semibold health-text-sm" style={{ color: '#0f172a' }}>
                      {org.organization_name || 'Unnamed'}
                    </div>
                  </td>
                  <td className="health-text-xs" style={{ color: '#64748b', fontFamily: 'monospace' }}>
                    {org.organization_id?.slice(0, 8)}...
                  </td>
                  <td>
                    {org.status === 'healthy' ? (
                      <span className="health-badge health-badge-green">
                        <FiCheckCircle size={12} style={{ marginRight: '4px' }} />
                        Healthy
                      </span>
                    ) : (
                      <span className="health-badge health-badge-red">
                        <FiXCircle size={12} style={{ marginRight: '4px' }} />
                        Unhealthy
                      </span>
                    )}
                  </td>
                  <td>
                    {org.error ? (
                      <span className="health-text-xs" style={{ color: '#991b1b' }}>
                        <FiAlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {org.error}
                      </span>
                    ) : (
                      <span className="health-text-xs health-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredOrgs.length > 0 && (
        <div className="health-text-xs health-text-muted health-mt-4">
          Showing {filteredOrgs.length} of {list?.length || 0} organizations
        </div>
      )}
    </div>
  );
};

export default OrganizationsHealth;