import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, StatusBadge, LoadingSkeleton } from '../../../components/dashboard/common';

export const SubscriptionAlerts = ({ data, loading }) => {
  if (loading) {
    return <LoadingSkeleton type="list" count={3} />;
  }

  if (!data || data.length === 0) {
    return (
      <DashboardCard title="Subscription Alerts">
        <div className="empty-state">No subscription alerts</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Subscription Alerts">
      <div className="subscription-alerts">
        {data.map((alert, index) => (
          <div key={index} className={`alert-item alert-${alert.severity}`}>
            <div className="alert-header">
              <span className="alert-tenant">{alert.tenant_name}</span>
              <StatusBadge status={alert.severity === 'critical' ? 'critical' : 'warning'} size="small" />
            </div>
            <div className="alert-message">{alert.message || `Subscription expiring in ${alert.days_remaining} days`}</div>
            <div className="alert-actions">
              <button className="renew-btn">Renew Now</button>
              <button className="contact-btn">Contact Tenant</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

SubscriptionAlerts.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool
};
export default SubscriptionAlerts;