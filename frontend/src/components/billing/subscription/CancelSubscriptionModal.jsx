import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './subscription.css';

export const CancelSubscriptionModal = ({ subscription, onClose, onSuccess }) => {
    const { cancel, loading } = useSubscription();
    const [atPeriodEnd, setAtPeriodEnd] = useState(true);
    const [reason, setReason] = useState('');
    const [step, setStep] = useState('confirm');

    const handleCancel = async () => {
        await cancel(subscription.id, atPeriodEnd, reason);
        if (onSuccess) onSuccess();
        setStep('success');
        setTimeout(() => { onClose(); }, 2000);
    };

    if (step === 'success') {
        return (
            <div className="cancel-modal-overlay" onClick={onClose}>
                <div className="cancel-modal success" onClick={(e) => e.stopPropagation()}>
                    <div className="success-icon"><FiCheckCircle /></div>
                    <h3>Subscription Cancelled</h3>
                    <p>Your subscription has been successfully cancelled.</p>
                    {atPeriodEnd && <p>You will have access until {new Date(subscription.current_period_end).toLocaleDateString()}.</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="cancel-modal-overlay" onClick={onClose}>
            <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cancel-modal-header">
                    <FiAlertTriangle className="warning-icon" />
                    <h3>Cancel Subscription</h3>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                <div className="cancel-modal-body">
                    <p>Are you sure you want to cancel your <strong>{subscription.plan?.name}</strong> subscription?</p>
                    <div className="cancel-options">
                        <label className="radio-label"><input type="radio" checked={atPeriodEnd} onChange={() => setAtPeriodEnd(true)} /> Cancel at end of billing period<span className="radio-desc">You'll keep access until {new Date(subscription.current_period_end).toLocaleDateString()}</span></label>
                        <label className="radio-label"><input type="radio" checked={!atPeriodEnd} onChange={() => setAtPeriodEnd(false)} /> Cancel immediately<span className="radio-desc">Your access will end right away</span></label>
                    </div>
                    <div className="cancel-reason"><label>Reason for cancelling (optional)</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="We'd love to know why you're leaving..." rows={3} /></div>
                    <div className="warning-message"><FiAlertTriangle /> Cancelling will remove access to premium features. Your data will be retained for 30 days.</div>
                </div>

                <div className="cancel-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Keep Subscription</button>
                    <button className="confirm-cancel-btn" onClick={handleCancel} disabled={loading}>{loading ? 'Processing...' : 'Yes, Cancel Subscription'}</button>
                </div>
            </div>
        </div>
    );
};

export default CancelSubscriptionModal;