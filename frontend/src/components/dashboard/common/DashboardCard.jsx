import React from 'react';
import PropTypes from 'prop-types';

export const DashboardCard = ({ 
  title, 
  children, 
  loading = false, 
  error = null,
  onRefresh = null,
  onExport = null,
  actions = null,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footer = null
}) => {
  if (loading) {
    return (
      <div className={`dashboard-card ${className}`}>
        <div className="dashboard-card__skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-body"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dashboard-card dashboard-card--error ${className}`}>
        <div className="dashboard-card__error">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
          {onRefresh && (
            <button onClick={onRefresh} className="btn-retry">Retry</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card ${className}`}>
      {(title || onRefresh || onExport || actions) && (
        <div className={`dashboard-card__header ${headerClassName}`}>
          {title && <h3 className="dashboard-card__title">{title}</h3>}
          <div className="dashboard-card__actions">
            {onRefresh && (
              <button onClick={onRefresh} className="icon-btn" title="Refresh">
                🔄
              </button>
            )}
            {onExport && (
              <button onClick={onExport} className="icon-btn" title="Export">
                📥
              </button>
            )}
            {actions}
          </div>
        </div>
      )}
      <div className={`dashboard-card__body ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="dashboard-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  actions: PropTypes.node,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footer: PropTypes.node
};