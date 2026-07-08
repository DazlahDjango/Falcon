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
  StructureSearchBar,
} from '../common';
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
      const response = await fetchSpan(value);
      setSpanData(response.data || response);
      setManagerId(value);
    } catch (err) {
      setError(err.message || 'Failed to fetch span of control');
      setSpanData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSpan]);

  const handleLoadOrganizationSpan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchOrganizationSpan();
      setSpanData(response.data || response);
      setManagerId('organization');
    } catch (err) {
      setError(err.message || 'Failed to fetch organization span');
      setSpanData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrganizationSpan]);

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
    if (directReports <= 10) return { status: 'healthy', color: '#10b981', icon: FiCheckCircle };
    if (directReports <= 15) return { status: 'warning', color: '#f59e0b', icon: FiAlertCircle };
    return { status: 'critical', color: '#ef4444', icon: FiAlertCircle };
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
        <div className="search-wrapper">
          <StructureSearchBar
            value={searchValue}
            onChange={handleSearch}
            placeholder="Enter manager ID to view span of control..."
            debounce={500}
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
          <p>{error}</p>
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

              {spanData.managers_with_warning && spanData.managers_with_warning.length > 0 && (
                <div className="warning-managers-section">
                  <h3>Managers with Span of Control Warnings</h3>
                  <div className="warning-managers-list">
                    {spanData.managers_with_warning.map((manager, index) => {
                      const health = getHealthStatus(manager.direct_reports);
                      return (
                        <div key={index} className="warning-manager-item">
                          <div className="manager-info">
                            <span className="manager-id">{manager.manager_user_id}</span>
                            <span className="manager-stats">
                              Direct: {manager.direct_reports} | Indirect: {manager.indirect_reports} | Total: {manager.total_reports}
                            </span>
                          </div>
                          <StructureStatusBadge
                            status={health.status === 'healthy' ? 'active' : health.status === 'warning' ? 'pending' : 'inactive'}
                            customLabel={health.status}
                            size="sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {spanData.distribution && (
                <div className="distribution-section">
                  <h3>Distribution</h3>
                  <div className="distribution-grid">
                    {Object.entries(spanData.distribution).map(([key, value]) => (
                      <div key={key} className="distribution-item">
                        <span className="distribution-label">{key}</span>
                        <span className="distribution-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="manager-span-view">
              <div className="span-summary">
                <div className="span-summary-item">
                  <span className="span-summary-label">Manager ID</span>
                  <span className="span-summary-value">{managerId}</span>
                </div>
                <div className="span-summary-item">
                  <span className="span-summary-label">Direct Reports</span>
                  <span className="span-summary-value">{spanData.direct_reports || 0}</span>
                </div>
                <div className="span-summary-item">
                  <span className="span-summary-label">Indirect Reports</span>
                  <span className="span-summary-value">{spanData.indirect_reports || 0}</span>
                </div>
                <div className="span-summary-item">
                  <span className="span-summary-label">Total Reports</span>
                  <span className="span-summary-value">{spanData.total_reports || 0}</span>
                </div>
                <div className="span-summary-item">
                  <span className="span-summary-label">Health</span>
                  {(() => {
                    const health = getHealthStatus(spanData.direct_reports || 0);
                    const Icon = health.icon;
                    return (
                      <span className={`span-health ${health.status}`}>
                        <Icon size={16} />
                        {health.status}
                      </span>
                    );
                  })()}
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
                      {spanData.direct_reports > 15 ? 'Overloaded' : 'Healthy'}
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