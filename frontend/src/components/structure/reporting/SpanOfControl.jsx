import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiUser,
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
  FiBarChart2,
} from 'react-icons/fi';
import { useReportingLines } from '../../../hooks/structure';
import {
  StructureLoading,
  StructureStatusBadge,
  StructureEmptyState,
} from '../common';
import UserSelector from '../../accounts/users/UserSelector';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './reporting.css';

export const SpanOfControl = () => {
  const navigate = useNavigate();
  const [managerId, setManagerId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [spanData, setSpanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchSpan, fetchOrganizationSpan, clearError } = useReportingLines({ autoFetch: false });

  const handleSearch = useCallback(async (value) => {
    setSearchValue(value);
    if (!value || value.length < 3) {
      setSpanData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const resultAction = await fetchSpan(value);
      const data = resultAction?.payload?.data || resultAction?.payload || resultAction?.data || resultAction;
      setSpanData(data);
      setManagerId(value);
    } catch (err) {
      setError(err?.displayMessage || err?.message || 'Failed to fetch span of control');
      setSpanData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSpan]);

  const handleLoadOrganizationSpan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resultAction = await fetchOrganizationSpan();
      const data = resultAction?.payload?.data || resultAction?.payload || resultAction?.data || resultAction;
      setSpanData(data);
      setManagerId('organization');
    } catch (err) {
      setError(err?.displayMessage || err?.message || 'Failed to fetch organization span');
      setSpanData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrganizationSpan]);

  useEffect(() => {
    handleLoadOrganizationSpan();
  }, [handleLoadOrganizationSpan]);

  const handleRefresh = useCallback(() => {
    if (managerId === 'organization') {
      handleLoadOrganizationSpan();
    } else if (managerId) {
      handleSearch(managerId);
    }
  }, [managerId, handleSearch, handleLoadOrganizationSpan]);

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.REPORTING_LINES);
  }, [navigate]);

  const getHealthStatus = (directReports) => {
    if (directReports <= 7) return { status: 'healthy', color: '#10b981', icon: FiCheckCircle };
    if (directReports <= 10) return { status: 'elevated (warning)', color: '#f59e0b', icon: FiAlertCircle };
    return { status: 'critical overload', color: '#ef4444', icon: FiAlertCircle };
  };

  if (isLoading) {
    return (
      <div className="span-of-control-loading">
        <StructureLoading text="Loading span of control..." />
      </div>
    );
  }

  const isOrganizationView = managerId === 'organization';

  return (
    <div className="span-of-control-container">
      <div className="span-of-control-header">
        <button onClick={handleBack} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Span of Control</h1>
      </div>

      <div className="span-of-control-toolbar">
        <div className="search-wrapper" style={{ minWidth: '300px' }}>
          <UserSelector
            value={managerId === 'organization' ? '' : managerId}
            onChange={(value) => {
              if (value) {
                handleSearch(value);
              } else {
                setManagerId('');
                setSpanData(null);
              }
            }}
            placeholder="Select a manager to view span..."
            className="w-full"
          />
        </div>
        <button onClick={handleLoadOrganizationSpan} className="btn btn-primary">
          <FiBarChart2 size={16} />
          Organization View
        </button>
        <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh">
          <FiRefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div className="span-of-control-error">
          <p>{typeof error === 'object' ? (error?.message || error?.detail || JSON.stringify(error)) : String(error || '')}</p>
          <button onClick={clearError} className="btn btn-secondary">
            Dismiss
          </button>
        </div>
      )}

      {spanData ? (
        <div className="span-of-control-body">
          {isOrganizationView ? (
            <div className="organization-span-view">
              <div className="org-summary-grid">
                <div className="org-summary-card">
                  <span className="org-summary-label">Average Direct Reports</span>
                  <span className="org-summary-value">{spanData.average_direct || 0}</span>
                </div>
                <div className="org-summary-card">
                  <span className="org-summary-label">Average Indirect Reports</span>
                  <span className="org-summary-value">{spanData.average_indirect || 0}</span>
                </div>
                <div className="org-summary-card">
                  <span className="org-summary-label">Average Total Reports</span>
                  <span className="org-summary-value">{spanData.average_total || 0}</span>
                </div>
                <div className="org-summary-card">
                  <span className="org-summary-label">Managers with Warning</span>
                  <span className="org-summary-value">{spanData.managers_with_warning?.length || 0}</span>
                </div>
              </div>

              <div className="warning-managers-section" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>All Operational Leaders & Managers ({spanData.managers?.length || 0})</h3>
                <div className="warning-managers-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {(spanData.managers || []).map((manager, index) => {
                    const health = getHealthStatus(manager.direct_reports);
                    return (
                      <div 
                        key={index} 
                        onClick={() => handleSearch(manager.manager_user_id)}
                        style={{
                          padding: '16px',
                          border: '1px solid var(--border-color, #e2e8f0)',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-surface, #ffffff)',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color, #4f46e5)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>{manager.manager_name || 'Leader'}</h4>
                            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>{manager.manager_position || 'Manager'}</p>
                          </div>
                          <StructureStatusBadge
                            status={health.status === 'healthy' ? 'active' : health.status === 'warning' ? 'pending' : 'inactive'}
                            customLabel={health.status}
                            size="sm"
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '10px' }}>
                          <span>👥 Direct: <strong>{manager.direct_reports}</strong></span>
                          <span>🌐 Total Subordinates: <strong>{manager.total_reports}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {spanData.distribution && (
                <div className="distribution-section" style={{ marginTop: '24px' }}>
                  <h3>Span Distribution</h3>
                  <div className="distribution-grid">
                    {Object.entries(spanData.distribution).map(([key, value]) => (
                      <div key={key} className="distribution-item">
                        <span className="distribution-label">{key} Direct Reports</span>
                        <span className="distribution-value">{value} Managers</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="manager-span-view">
              <div className="span-summary" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div className="span-summary-item" style={{ padding: '12px 20px', background: 'var(--bg-surface, #fff)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span className="span-summary-label" style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Leader</span>
                  <span className="span-summary-value" style={{ fontSize: '16px', fontWeight: 'bold' }}>{spanData.manager_name || 'Selected Manager'}</span>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{spanData.manager_position || ''}</span>
                </div>
                <div className="span-summary-item" style={{ padding: '12px 20px', background: 'var(--bg-surface, #fff)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span className="span-summary-label" style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Direct Reports</span>
                  <span className="span-summary-value" style={{ fontSize: '18px', fontWeight: 'bold', color: '#4f46e5' }}>{spanData.direct_reports || 0}</span>
                </div>
                <div className="span-summary-item" style={{ padding: '12px 20px', background: 'var(--bg-surface, #fff)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span className="span-summary-label" style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Indirect Reports</span>
                  <span className="span-summary-value" style={{ fontSize: '18px', fontWeight: 'bold', color: '#0ea5e9' }}>{spanData.indirect_reports || 0}</span>
                </div>
                <div className="span-summary-item" style={{ padding: '12px 20px', background: 'var(--bg-surface, #fff)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span className="span-summary-label" style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Total Subordinates</span>
                  <span className="span-summary-value" style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{spanData.total_reports || 0}</span>
                </div>
              </div>

              <div className="span-details">
                <div className="span-metrics">
                  <div className="metric-card">
                    <div className="metric-value">{spanData.direct_reports || 0}</div>
                    <div className="metric-label">Direct Reports</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{spanData.indirect_reports || 0}</div>
                    <div className="metric-label">Indirect Reports</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{spanData.total_reports || 0}</div>
                    <div className="metric-label">Total Reports</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">
                      {spanData.direct_reports > 15 ? '⚠️' : '✅'}
                    </div>
                    <div className="metric-label">
                      {spanData.direct_reports > 15 ? 'Overloaded' : 'Optimal Capacity'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        !isLoading && (
          <StructureEmptyState
            title="Search for Span of Control"
            description="Enter a manager ID above to view their span of control, or click 'Organization View' to see organization-wide metrics."
            icon={FiUsers}
          />
        )
      )}
    </div>
  );
};

export default SpanOfControl;
