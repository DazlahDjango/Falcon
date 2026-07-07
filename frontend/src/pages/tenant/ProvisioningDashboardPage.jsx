import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProvision } from '../../hooks/tenant/useProvision';
import { ProvisioningDashboardCard } from '../../components/tenant/provisioning';

/**
 * Global admin provisioning monitor (Super Admin only).
 * Route: /tenant/provisioning
 */
export const ProvisioningDashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const {
    list,
    failed,
    inProgress,
    loading,
    actionLoading,
    error,
    actionError,
    healthSummary,
    fetchList,
    fetchFailed,
    fetchInProgressList,
    trigger,
    retry,
    rollback,
    clearErrors,
  } = useProvision();

  const loadAll = useCallback(() => {
    fetchList();
    fetchFailed();
    fetchInProgressList();
  }, [fetchList, fetchFailed, fetchInProgressList]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (inProgress.length === 0) return undefined;
    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, [inProgress.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTrigger = useCallback(async (orgId) => {
    await trigger(orgId);
    setTimeout(loadAll, 800);
  }, [trigger, loadAll]);

  const handleRetry = useCallback(async (orgId) => {
    await retry(orgId);
    setTimeout(loadAll, 800);
  }, [retry, loadAll]);

  const handleRollback = useCallback(async (orgId) => {
    await rollback(orgId);
    setTimeout(loadAll, 800);
  }, [rollback, loadAll]);

  const handleViewDetail = useCallback((orgId) => {
    navigate(`/tenant/provisioning/${orgId}`);
  }, [navigate]);

  const displayedItems = {
    all: list,
    'in-progress': inProgress,
    failed,
  }[activeTab] || list;

  const stats = [
    { label: 'Total', value: healthSummary?.total ?? list.length, cls: '' },
    { label: 'Active', value: healthSummary?.active ?? 0, cls: 'prov-stat-card-active' },
    { label: 'In Progress', value: inProgress.length, cls: 'prov-stat-card-running' },
    { label: 'Failed', value: failed.length, cls: 'prov-stat-card-failed' },
    {
      label: 'Health',
      value: `${healthSummary?.healthPercentage ?? 100}%`,
      cls: failed.length > 0 ? 'prov-stat-card-failed' : 'prov-stat-card-active',
    },
  ];

  const tabs = [
    { key: 'all', label: `All (${list.length})` },
    { key: 'in-progress', label: `In Progress (${inProgress.length})` },
    { key: 'failed', label: `Failed (${failed.length})` },
  ];

  return (
    <div className="tenant-app">
      <div className="org-container">
        <div className="prov-page-header">
          <div>
            <h1 className="prov-page-title">Provisioning Dashboard</h1>
            <p className="prov-page-subtitle">
              Monitor and manage organization provisioning pipelines
            </p>
          </div>
          <button
            type="button"
            className="org-btn org-btn-secondary"
            onClick={loadAll}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {(error || actionError) && (
          <div className="prov-error-banner org-mb-4">
            <span className="prov-error-banner-icon">⚠</span>
            <div>
              <div className="prov-error-banner-title">
                {actionError ? 'Action failed' : 'Failed to load data'}
              </div>
              <div className="prov-error-banner-msg">{actionError || error}</div>
            </div>
            <button
              type="button"
              className="org-btn org-btn-secondary org-btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={clearErrors}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="prov-stats-grid">
          {stats.map((s) => (
            <div key={s.label} className={`prov-stat-card ${s.cls}`}>
              <span className="prov-stat-label">{s.label}</span>
              <span className="prov-stat-value">{s.value}</span>
            </div>
          ))}
        </div>

        {inProgress.length > 0 && (
          <div className="prov-status-badge prov-status-provisioning org-mb-4" style={{ display: 'inline-flex' }}>
            {inProgress.length} organization{inProgress.length > 1 ? 's' : ''} currently provisioning — auto-refreshing every 10s
          </div>
        )}

        <div className="prov-tabs org-mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`prov-tab ${activeTab === tab.key ? 'prov-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && displayedItems.length === 0 ? (
          <div className="org-loading">
            <div className="org-loading-spinner" />
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="org-empty-state">
            <div className="org-empty-state-icon">
              {activeTab === 'failed' ? '✓' : activeTab === 'in-progress' ? '○' : '—'}
            </div>
            <div className="org-empty-state-text">
              {activeTab === 'failed'
                ? 'No failed provisionings — all clear!'
                : activeTab === 'in-progress'
                  ? 'No provisioning pipelines currently running.'
                  : 'No organizations found.'}
            </div>
          </div>
        ) : (
          <div className="prov-cards-grid">
            {displayedItems.map((org) => (
              <ProvisioningDashboardCard
                key={org.id}
                org={org}
                onTrigger={handleTrigger}
                onRetry={handleRetry}
                onRollback={handleRollback}
                onViewDetail={handleViewDetail}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvisioningDashboardPage;
