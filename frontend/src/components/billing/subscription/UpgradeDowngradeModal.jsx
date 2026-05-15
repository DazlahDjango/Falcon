import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PlanSelector } from '../plans/PlanSelector';
import { usePlans, useSubscription } from '../../../hooks/billing';

export const UpgradeDowngradeModal = ({ isOpen, onClose, subscription, changeType, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { plans, loading: plansLoading } = usePlans();
    const { upgradePlan, downgradePlan } = useSubscription();

    if (!isOpen) return null;

    const isUpgrade = changeType === 'upgrade';
    const title = isUpgrade ? 'Upgrade Plan' : 'Downgrade Plan';
    const subtitle = isUpgrade 
        ? 'Choose a higher-tier plan to unlock more features'
        : 'Choose a lower-tier plan (changes apply at next billing cycle)';

    const handleSelectPlan = async (plan, billingCycle) => {
        setLoading(true);
        try {
            if (isUpgrade) {
                await upgradePlan(plan.id, false);
            } else {
                await downgradePlan(plan.id, false);
            }
            onSuccess?.();
        } catch (error) {
            console.error('[UpgradeDowngradeModal] Error:', error);
            alert(`Failed to ${isUpgrade ? 'upgrade' : 'downgrade'} plan. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const filteredPlans = plans.filter(p => {
        if (isUpgrade) {
            // Show higher-tier plans only
            const upgradeOrder = { basic: 'professional', professional: 'enterprise' };
            return p.plan_type === upgradeOrder[subscription?.plan?.plan_type];
        } else {
            // Show lower-tier plans only
            const downgradeOrder = { enterprise: 'professional', professional: 'basic' };
            return p.plan_type === downgradeOrder[subscription?.plan?.plan_type];
        }
    });

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal upgrade-modal">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="upgrade-modal-current">
                        <span>Current Plan:</span>
                        <strong>{subscription?.plan?.name}</strong>
                    </div>

                    {plansLoading ? (
                        <div className="upgrade-modal-loading">Loading plans...</div>
                    ) : (
                        <PlanSelector
                            plans={filteredPlans}
                            onSelect={handleSelectPlan}
                            title={title}
                            subtitle={subtitle}
                        />
                    )}

                    {!isUpgrade && (
                        <div className="upgrade-modal-note">
                            <span>ℹ️</span>
                            <p>
                                Downgrades take effect at the start of your next billing cycle.
                                You'll keep access to current features until then.
                            </p>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="modal-loading-overlay">
                        <div className="modal-loading-spinner"></div>
                        <p>Processing your request...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

UpgradeDowngradeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    subscription: PropTypes.object.isRequired,
    changeType: PropTypes.oneOf(['upgrade', 'downgrade']),
    onSuccess: PropTypes.func,
};

export default UpgradeDowngradeModal;