import React, { useState, useEffect } from 'react';
import { FiX, FiArrowUp, FiArrowDown, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import { usePlans } from '../../../hooks/billing/usePlans';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { PriceDisplay } from '../shared/PriceDisplay';
import './subscription.css';

export const UpgradeDowngradeModal = ({ subscription, direction, onClose, onSuccess }) => {
    const { upgrade, downgrade, loading } = useSubscription();
    const { plans, fetchAllPlans } = usePlans({ autoFetch: true });
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [immediate, setImmediate] = useState(true);
    const [step, setStep] = useState('select');

    useEffect(() => { if (!plans.length) fetchAllPlans({}); }, [plans.length, fetchAllPlans]);

    const availablePlans = plans.filter(p => {
        if (direction === 'upgrade') {
            if (subscription.plan?.plan_type === 'basic') return p.plan_type === 'professional' || p.plan_type === 'enterprise';
            if (subscription.plan?.plan_type === 'professional') return p.plan_type === 'enterprise';
            return false;
        } else {
            if (subscription.plan?.plan_type === 'enterprise') return p.plan_type === 'professional' || p.plan_type === 'basic';
            if (subscription.plan?.plan_type === 'professional') return p.plan_type === 'basic';
            return false;
        }
    });

    const handleProceed = async () => {
        if (!selectedPlan) return;
        setStep('processing');
        try {
            if (direction === 'upgrade') await upgrade(subscription.id, selectedPlan.id, immediate);
            else await downgrade(subscription.id, selectedPlan.id, immediate);
            if (onSuccess) onSuccess();
            setStep('success');
            setTimeout(() => onClose(), 2000);
        } catch (error) { setStep('error'); }
    };

    const getProrationInfo = () => {
        if (!selectedPlan || !immediate) return null;
        const daysRemaining = subscription.days_until_expiry;
        const totalDays = 30;
        const remainingValue = (subscription.amount / totalDays) * daysRemaining;
        const newPlanCost = (selectedPlan.price / totalDays) * daysRemaining;
        const additional = newPlanCost - remainingValue;
        if (additional > 0) return { additional, message: `You'll pay an additional ${CurrencyFormatter({ amount: additional, currency: subscription.currency })} for the remaining ${daysRemaining} days.` };
        if (additional < 0) return { additional, message: `You'll receive a credit of ${CurrencyFormatter({ amount: Math.abs(additional), currency: subscription.currency })}.` };
        return { additional: 0, message: 'No additional charge for this upgrade.' };
    };

    const proration = getProrationInfo();

    if (step === 'success') {
        return (<div className="upgrade-modal-overlay" onClick={onClose}><div className="upgrade-modal success" onClick={(e) => e.stopPropagation()}><div className="success-icon"><FiCheck /></div><h3>{direction === 'upgrade' ? 'Upgrade' : 'Downgrade'} Successful!</h3><p>Your plan has been successfully {direction === 'upgrade' ? 'upgraded' : 'downgraded'}.</p></div></div>);
    }

    if (step === 'error') {
        return (<div className="upgrade-modal-overlay" onClick={onClose}><div className="upgrade-modal error" onClick={(e) => e.stopPropagation()}><div className="error-icon"><FiAlertCircle /></div><h3>{direction === 'upgrade' ? 'Upgrade' : 'Downgrade'} Failed</h3><p>Something went wrong. Please try again or contact support.</p><button onClick={() => setStep('select')}>Try Again</button></div></div>);
    }

    return (
        <div className="upgrade-modal-overlay" onClick={onClose}>
            <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
                <div className="upgrade-modal-header">
                    <h3>{direction === 'upgrade' ? <><FiArrowUp /> Upgrade Plan</> : <><FiArrowDown /> Downgrade Plan</>}</h3>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                <div className="upgrade-modal-body">
                    <div className="current-plan-badge">Current: {subscription.plan?.name} ({CurrencyFormatter({ amount: subscription.amount, currency: subscription.currency })}/{subscription.billing_interval})</div>

                    <div className="plan-selector">
                        <h4>Select New Plan</h4>
                        <div className="plan-options">
                            {availablePlans.map(plan => (
                                <div key={plan.id} className={`plan-option ${selectedPlan?.id === plan.id ? 'selected' : ''}`} onClick={() => setSelectedPlan(plan)}>
                                    <div className="plan-option-name">{plan.name}</div>
                                    <PriceDisplay price={plan.price} yearlyPrice={plan.yearly_price} currency={plan.currency} showYearly={false} />
                                    <div className="plan-option-features">{plan.max_users === -1 ? 'Unlimited users' : `Up to ${plan.max_users} users`}</div>
                                    {selectedPlan?.id === plan.id && <FiCheck className="check-icon" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="upgrade-timing">
                        <label className="radio-label"><input type="radio" checked={immediate} onChange={() => setImmediate(true)} /> Apply immediately<span className="radio-desc">{proration?.message || 'Changes will take effect right away.'}</span></label>
                        <label className="radio-label"><input type="radio" checked={!immediate} onChange={() => setImmediate(false)} /> Apply at next billing cycle<span className="radio-desc">Changes will take effect on {new Date(subscription.current_period_end).toLocaleDateString()}</span></label>
                    </div>

                    <div className="upgrade-summary">
                        <div className="summary-row"><span>Current monthly price</span><span><CurrencyFormatter amount={subscription.amount} currency={subscription.currency} /></span></div>
                        <div className="summary-row"><span>New monthly price</span><span><CurrencyFormatter amount={selectedPlan?.price || 0} currency={subscription.currency} /></span></div>
                        {immediate && proration && proration.additional !== 0 && (<div className={`summary-row highlight ${proration.additional > 0 ? 'positive' : 'negative'}`}><span>Today's charge</span><span>{proration.additional > 0 ? '+' : ''}<CurrencyFormatter amount={Math.abs(proration.additional)} currency={subscription.currency} /></span></div>)}
                    </div>
                </div>

                <div className="upgrade-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="confirm-btn" onClick={handleProceed} disabled={!selectedPlan || loading}>{loading ? 'Processing...' : `${direction === 'upgrade' ? 'Upgrade' : 'Downgrade'} Now`}</button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeDowngradeModal;