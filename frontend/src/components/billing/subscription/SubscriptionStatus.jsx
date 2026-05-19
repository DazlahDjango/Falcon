/**
 * SubscriptionStatus Component
 * Displays current subscription status with details
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StatusBadge } from '../shared/StatusBadge';
import { PriceDisplay } from '../shared/PriceDisplay';
import { renderBillingIcon } from '../shared/BillingIcons';

export const SubscriptionStatus = ({ subscription, loading }) => {
    if (loading) {
        return <div className="subscription-status-skeleton">Loading subscription...</div>;
    }

    if (!subscription) {
        return (
            <div className="subscription-status-empty">
                <p>No active subscription</p>
                <a href="/plans" className="subscription-status-link">View Plans</a>
            </div>
        );
    }

    const isActive = subscription.is_active_status?.is_active;
    const isOnTrial = subscription.is_active_status?.is_on_trial;
    const daysUntilExpiry = subscription.is_active_status?.days_until_expiry;
    const trialDaysRemaining = subscription.is_active_status?.trial_days_remaining;

    return (
        <div className="subscription-status">
            <div className="subscription-status-header">
                <h3 className="subscription-status-title">Current Subscription</h3>
                <StatusBadge status={subscription.status} />
            </div>

            <div className="subscription-status-plan">
                <span className="subscription-status-plan-name">{subscription.plan?.name}</span>
                <PriceDisplay 
                    amount={subscription.amount} 
                    period={subscription.billing_interval}
                />
            </div>

            {isOnTrial && (
                <div className="subscription-status-trial">
                    <span className="subscription-status-trial-icon">{renderBillingIcon('pending', { size: 16 })}</span>
                    <span>
                        Trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}
                    </span>
                </div>
            )}

            {isActive && !isOnTrial && (
                <div className="subscription-status-renewal">
                    <span className="subscription-status-renewal-icon">{renderBillingIcon('renewal', { size: 16 })}</span>
                    <span>
                        Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                        {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                            <span className="subscription-status-renewal-warning">
                                (Renews in {daysUntilExpiry} days)
                            </span>
                        )}
                    </span>
                </div>
            )}

            <div className="subscription-status-features">
                <h4>Included Features</h4>
                <ul>
                    <li>{renderBillingIcon('success', { size: 14 })} Up to {subscription.plan?.max_users === -1 ? 'unlimited' : subscription.plan?.max_users} users</li>
                    <li>{renderBillingIcon('success', { size: 14 })} Up to {subscription.plan?.max_kpis === -1 ? 'unlimited' : subscription.plan?.max_kpis} KPIs</li>
                    {subscription.plan?.custom_branding && <li>{renderBillingIcon('success', { size: 14 })} Custom branding</li>}
                    {subscription.plan?.api_access && <li>{renderBillingIcon('success', { size: 14 })} API access</li>}
                    {subscription.plan?.advanced_analytics && <li>{renderBillingIcon('success', { size: 14 })} Advanced analytics</li>}
                </ul>
            </div>

            <div className="subscription-status-actions">
                {subscription.auto_renew && !subscription.cancel_at_period_end && (
                    <button className="subscription-status-cancel">
                        Cancel Subscription
                    </button>
                )}
                {!subscription.auto_renew && isActive && (
                    <button className="subscription-status-renew">
                        Renew Now
                    </button>
                )}
            </div>
        </div>
    );
};

SubscriptionStatus.propTypes = {
    subscription: PropTypes.object,
    loading: PropTypes.bool,
};

export default SubscriptionStatus;