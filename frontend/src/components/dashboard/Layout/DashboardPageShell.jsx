import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { FiShield, FiRadio } from 'react-icons/fi';
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
  const currentUser = useSelector((state) => state.auth?.user);
  const isActiveStatus = currentUser?.is_active;

  const statusText = isActiveStatus != null
    ? (isActiveStatus ? 'Active' : 'Inactive')
    : (connected ? 'Live' : 'Offline');

  const statusTitle = isActiveStatus != null
    ? (isActiveStatus ? 'User active' : 'User inactive')
    : (connected ? 'Live updates active' : 'Reconnecting…');

  const statusClassNames = `dashboard-page__live ${((isActiveStatus != null && isActiveStatus) || (!currentUser?.is_active && connected)) ? 'dashboard-page__live--on' : ''}`.trim();

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
              className={statusClassNames}
              title={statusTitle}
            >
              <FiRadio size={14} />
              {statusText}
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
