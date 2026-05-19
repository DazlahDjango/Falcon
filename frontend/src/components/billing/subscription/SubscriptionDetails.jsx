import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StatusBadge } from '../shared/StatusBadge';
import { PriceDisplay } from '../shared/PriceDisplay';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';
import { UpgradeDowngradeModal } from './UpgradeDowngradeModal';
import { renderBillingIcon } from '../shared/BillingIcons';

export const SubscriptionDetails = ({ subscription, onRefresh }) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [changeType, setChangeType] = useState(null);

    if (!subscription) {
        return (
            <div className="subscription-details-empty">
                <p>No subscription found</p>
                <a href="/plans" className="subscription-details-link">Get Started</a>
            </div>
        );
    }

    const isActive = subscription.is_active_status?.is_active;
    const canUpgrade = subscription.plan?.plan_type !== 'enterprise';
    const canDowngrade = subscription.plan?.plan_type !== 'basic';

    const handleUpgrade = () => {
        setChangeType('upgrade');
        setShowChangeModal(true);
    };

    const handleDowngrade = () => {
        setChangeType('downgrade');
        setShowChangeModal(true);
    };

    const handleCancel = () => {
        setShowCancelModal(true);
    };

    const handleModalClose = () => {
        setShowCancelModal(false);
        setShowChangeModal(false);
        setChangeType(null);
        onRefresh?.();
    };

    return (
        <>
            <div className="subscription-details">
                <div className="subscription-details-header">
                    <h2 className="subscription-details-title">Subscription Details</h2>
                    <StatusBadge status={subscription.status} />
                </div>

                <div className="subscription-details-card">
                    <div className="subscription-details-plan">
                        <div className="subscription-details-plan-info">
                            <span className="subscription-details-plan-name">{subscription.plan?.name}</span>
                            <span className="subscription-details-plan-billing">
                                {subscription.billing_interval} billing
                            </span>
                        </div>
                        <PriceDisplay 
                            amount={subscription.amount} 
                            period={subscription.billing_interval}
                            size="large"
                        />
                    </div>

                    <div className="subscription-details-dates">
                        <div className="subscription-details-date">
                            <span className="subscription-details-date-label">Started</span>
                            <span>{new Date(subscription.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="subscription-details-date">
                            <span className="subscription-details-date-label">Current Period</span>
                            <span>
                                {new Date(subscription.current_period_start).toLocaleDateString()} - 
                                {new Date(subscription.current_period_end).toLocaleDateString()}
                            </span>
                        </div>
                        {subscription.trial_end_date && (
                            <div className="subscription-details-date">
                                <span className="subscription-details-date-label">Trial Ends</span>
                                <span>{new Date(subscription.trial_end_date).toLocaleDateString()}</span>
                            </div>
                        )}
                        {subscription.cancel_at_period_end && (
                            <div className="subscription-details-cancel-note">
                                {renderBillingIcon('warning', { size: 16 })} Subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    <div className="subscription-details-settings">
                        <h4>Billing Settings</h4>
                        <div className="subscription-details-setting">
                            <span>Auto-renewal</span>
                            <span className={subscription.auto_renew ? 'text-success' : 'text-error'}>
                                {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>

                    {isActive && (
                        <div className="subscription-details-actions">
                            {canUpgrade && (
                                <button 
                                    className="subscription-details-btn-upgrade"
                                    onClick={handleUpgrade}
                                >
                                    Upgrade Plan
                                </button>
                            )}
                            {canDowngrade && (
                                <button 
                                    className="subscription-details-btn-downgrade"
                                    onClick={handleDowngrade}
                                >
                                    Downgrade Plan
                                </button>
                            )}
                            {!subscription.cancel_at_period_end && (
                                <button 
                                    className="subscription-details-btn-cancel"
                                    onClick={handleCancel}
                                >
                                    Cancel Subscription
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CancelSubscriptionModal
                isOpen={showCancelModal}
                onClose={handleModalClose}
                subscription={subscription}
                onSuccess={handleModalClose}
            />

            <UpgradeDowngradeModal
                isOpen={showChangeModal}
                onClose={handleModalClose}
                subscription={subscription}
                changeType={changeType}
                onSuccess={handleModalClose}
            />
        </>
    );
};

SubscriptionDetails.propTypes = {
    subscription: PropTypes.object,
    onRefresh: PropTypes.func,
};

export default SubscriptionDetails;