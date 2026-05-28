import React from 'react';
import PropTypes from 'prop-types';
import { FiRefreshCw, FiShield, FiRadio } from 'react-icons/fi';
import { useDashboardPage } from '../../../hooks/dashboard';
import { RefreshButton } from '../common/RefreshButton';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

/**
 * Standard page chrome for all PMS dashboard routes (per dashrequirements / pendings).
 */
export const DashboardPageShell = ({
  title,
  subtitle,
  description,
  dashboardType,
  onRealtimeMessage,
  onRefresh,
  loading = false,
  error = null,
  actions = null,
  children,
  className = '',
  showLiveBadge = true,
}) => {
  const { connected, refresh, isRefreshing } = useDashboardPage({
    dashboardType,
    onRealtimeMessage,
    onRefresh,
  });

  const handleRefresh = () => {
    refresh();
    onRefresh?.();
  };

  return (
    <div className={`dashboard-page ${className}`.trim()}>
      <header className="dashboard-page__header">
        <div className="dashboard-page__heading">
          <h1 className="dashboard-page__title">{title}</h1>
          {subtitle && <p className="dashboard-page__subtitle">{subtitle}</p>}
          {description && <p className="dashboard-page__description">{description}</p>}
        </div>
        <div className="dashboard-page__actions">
          {showLiveBadge && (
            <span
              className={`dashboard-page__live ${connected ? 'dashboard-page__live--on' : ''}`}
              title={connected ? 'Live updates active' : 'Reconnecting…'}
            >
              <FiRadio size={14} />
              {connected ? 'Live' : 'Offline'}
            </span>
          )}
          <span className="dashboard-page__secure" title="RBAC-scoped data · audited drill-down">
            <FiShield size={14} />
            Secured
          </span>
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={loading || isRefreshing}
          />
          {actions}
        </div>
      </header>

      {error && (
        <div className="dashboard-page__error" role="alert">
          {typeof error === 'string' ? error : error.message || 'Unable to load this view.'}
        </div>
      )}

      <div className="dashboard-page__body">
        {loading && !children ? (
          <LoadingSkeleton type="card" />
        ) : (
          children
        )}
      </div>
    </div>
  );
};

DashboardPageShell.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  dashboardType: PropTypes.string,
  onRealtimeMessage: PropTypes.func,
  onRefresh: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  actions: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  showLiveBadge: PropTypes.bool,
};

export default DashboardPageShell;
