import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiDollarSign, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiXCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import { CancelSubscriptionModal } from '../subscription/CancelSubscriptionModal';
import { UpgradeDowngradeModal } from '../subscription/UpgradeDowngradeModal';
import './billing-portal.css';

export const PortalSubscription = ({ subscription, loading, onUpdate }) => {
    const navigate = useNavigate();
    const { renew, loading: actionLoading } = useSubscription();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeDirection, setUpgradeDirection] = useState('upgrade');
    const [renewing, setRenewing] = useState(false);

    const handleRenew = async () => {
        if (!window.confirm('Renew your subscription now? This will charge your saved payment method.')) return;
        setRenewing(true);
        await renew(subscription?.id);
        if (onUpdate) onUpdate();
        setRenewing(false);
    };

    if (loading) return <LoadingSkeleton type="card" count={2} />;
    if (!subscription) return <div className="portal-empty">No active subscription. <button onClick={() => navigate('/billing/plans')}>View Plans</button></div>;

    const isExpiringSoon = subscription.days_until_expiry <= 7 && subscription.days_until_expiry > 0;
    const canUpgrade = subscription.plan?.plan_type === 'basic' || subscription.plan?.plan_type === 'professional';
    const canDowngrade = subscription.plan?.plan_type === 'professional' || subscription.plan?.plan_type === 'enterprise';

    return (
        <div className="portal-subscription">
            <BillingCard title="Current Plan" icon={<FiCalendar />}>
                <div className="sub-details">
                    <div className="sub-plan"><span className="plan-name">{subscription.plan?.name}</span><StatusBadge type="subscription" status={subscription.status} size="lg" /></div>
                    <div className="sub-pricing"><CurrencyFormatter amount={subscription.amount} currency={subscription.currency} /><span className="interval">/{subscription.billing_interval}</span></div>
                    <div className="sub-period"><span>Current Period:</span> {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}</div>
                    {isExpiringSoon && <div className="sub-warning"><FiAlertCircle /> Your subscription expires in {subscription.days_until_expiry} days</div>}
                    {subscription.cancel_at_period_end && <div className="sub-warning cancel"><FiXCircle /> Subscription will cancel on {new Date(subscription.current_period_end).toLocaleDateString()}</div>}
                </div>
            </BillingCard>

            <div className="sub-actions-grid">
                <BillingCard title="Billing Controls" icon={<FiDollarSign />}>
                    <div className="action-buttons">
                        {subscription.auto_renew && !subscription.cancel_at_period_end && <button className="portal-action-btn primary" onClick={handleRenew} disabled={renewing}><FiRefreshCw className={renewing ? 'spin' : ''} /> Renew Now</button>}
                        {canUpgrade && <button className="portal-action-btn upgrade" onClick={() => { setUpgradeDirection('upgrade'); setShowUpgradeModal(true); }}><FiArrowUp /> Upgrade Plan</button>}
                        {canDowngrade && <button className="portal-action-btn downgrade" onClick={() => { setUpgradeDirection('downgrade'); setShowUpgradeModal(true); }}><FiArrowDown /> Downgrade Plan</button>}
                        {!subscription.cancel_at_period_end && <button className="portal-action-btn danger" onClick={() => setShowCancelModal(true)}>Cancel Subscription</button>}
                    </div>
                </BillingCard>

                <BillingCard title="Subscription Features" icon={<FiCheckCircle />}>
                    <div className="feature-list">
                        {subscription.plan?.features_list_display?.slice(0, 8).map((f, i) => (<div key={i} className="feature-item"><FiCheckCircle /> {f}</div>))}
                        {subscription.plan?.features_list_display?.length > 8 && <div className="feature-more">+{subscription.plan.features_list_display.length - 8} more features</div>}
                    </div>
                </BillingCard>
            </div>

            {showCancelModal && <CancelSubscriptionModal subscription={subscription} onClose={() => setShowCancelModal(false)} onSuccess={() => { onUpdate(); setShowCancelModal(false); }} />}
            {showUpgradeModal && <UpgradeDowngradeModal subscription={subscription} direction={upgradeDirection} onClose={() => setShowUpgradeModal(false)} onSuccess={() => { onUpdate(); setShowUpgradeModal(false); }} />}
        </div>
    );
};

export default PortalSubscription;