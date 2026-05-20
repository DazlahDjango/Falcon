import React from 'react';
import PropTypes from 'prop-types';
import { DashboardCard } from '../common/DashboardCard';
import { StatusBadge } from '../common/StatusBadge';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

export const SubscriptionStatusWidget = ({ 
  data, 
  loading = false, 
  error = null,
  title = 'Subscription Status',
  onRefresh,
  onRenewClick,
  onUpgradeClick
}) => {
  if (loading) {
    return <LoadingSkeleton type="card" />;
  }

  if (error) {
    return (
      <DashboardCard title={title} error={error} onRefresh={onRefresh}>
        <EmptyState title="Failed to load subscription data" message={error} />
      </DashboardCard>
    );
  }

  if (!data) {
    return (
      <DashboardCard title={title} onRefresh={onRefresh}>
        <EmptyState title="No Subscription Data" message="No subscription information available." />
      </DashboardCard>
    );
  }

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry(data.subscription_expires_at);
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

  const getStatusColor = () => {
    if (data.subscription_status === 'active') return '#10b981';
    if (data.subscription_status === 'trial') return '#f59e0b';
    if (data.subscription_status === 'expired') return '#ef4444';
    return '#6b7280';
  };

  return (
    <DashboardCard title={title} onRefresh={onRefresh}>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Current Plan</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {data.subscription_plan || 'Basic'}
            </div>
          </div>
          <StatusBadge status={data.subscription_status} size="large" />
        </div>

        <div style={{ 
          padding: '16px', 
          background: '#f9fafb', 
          borderRadius: '12px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#6b7280' }}>Expires on</span>
            <span style={{ fontWeight: 500 }}>
              {data.subscription_expires_at 
                ? new Date(data.subscription_expires_at).toLocaleDateString() 
                : '—'}
            </span>
          </div>
          
          {daysUntilExpiry !== null && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '13px',
                marginBottom: '6px'
              }}>
                <span>{isExpired ? 'Expired' : 'Days remaining'}</span>
                <span style={{ 
                  fontWeight: 600,
                  color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#10b981'
                }}>
                  {isExpired ? '0' : daysUntilExpiry} days
                </span>
              </div>
              <div style={{ 
                background: '#e5e7eb', 
                borderRadius: '10px', 
                height: '8px', 
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${Math.min(100, Math.max(0, (daysUntilExpiry / 365) * 100))}%`, 
                  height: '100%', 
                  background: getStatusColor(),
                  borderRadius: '10px'
                }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {onRenewClick && (isExpiringSoon || isExpired) && (
            <button
              onClick={onRenewClick}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {isExpired ? 'Renew Now' : 'Renew Subscription'}
            </button>
          )}
          {onUpgradeClick && data.subscription_plan !== 'enterprise' && (
            <button
              onClick={onUpgradeClick}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #3b82f6',
                background: 'white',
                color: '#3b82f6',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Upgrade Plan
            </button>
          )}
        </div>

        {data.features_enabled && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Features</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.features_enabled.map((feature, idx) => (
                <span key={idx} style={{
                  padding: '4px 10px',
                  background: '#e0e7ff',
                  borderRadius: '20px',
                  fontSize: '11px',
                  color: '#3730a3'
                }}>
                  ✓ {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

SubscriptionStatusWidget.propTypes = {
  data: PropTypes.shape({
    subscription_plan: PropTypes.string,
    subscription_status: PropTypes.string,
    subscription_expires_at: PropTypes.string,
    features_enabled: PropTypes.array
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
  onRefresh: PropTypes.func,
  onRenewClick: PropTypes.func,
  onUpgradeClick: PropTypes.func
};