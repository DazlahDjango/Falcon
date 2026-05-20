import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard, LoadingSkeleton } from '../../../components/dashboard/common';

export const BillingOverview = ({ data, loading }) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (!data) {
    return (
      <DashboardCard title="Billing Overview">
        <div className="empty-state">No billing data available</div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Billing Overview">
      <div className="billing-overview">
        <div className="revenue">
          <div className="revenue-label">Monthly Recurring</div>
          <div className="revenue-value">${data.monthly_recurring?.toLocaleString() || 0}</div>
        </div>
        <div className="revenue">
          <div className="revenue-label">Annual Recurring</div>
          <div className="revenue-value">${data.annual_recurring?.toLocaleString() || 0}</div>
        </div>
        <div className="subscription-count">
          <div className="count-value">{data.total_active_subscriptions || 0}</div>
          <div className="count-label">Active Subscriptions</div>
        </div>
        <div className="trend">
          <span className={`trend-${data.growth_trend === 'up' ? 'up' : 'down'}`}>
            {data.growth_percentage || 0}% vs last month
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};

BillingOverview.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};