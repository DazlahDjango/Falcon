import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/billing';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';

export const CancelPage = () => {
    const navigate = useNavigate();
    const { subscription, cancelSubscription, loading } = useSubscription();
    const [reason, setReason] = useState('');
    const [atPeriodEnd, setAtPeriodEnd] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handleCancel = async () => {
        setSubmitting(true);
        try {
            await cancelSubscription(subscription.id, { at_period_end: atPeriodEnd, reason });
            navigate('/subscriptions');
        } catch (error) {
            console.error('Cancel error:', error);
            alert('Failed to cancel subscription. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <BillingLayout title="Cancel Subscription"><div>Loading...</div></BillingLayout>;
    }

    if (!subscription) {
        navigate('/subscriptions');
        return null;
    }

    return (
        <BillingLayout 
            title="Cancel Subscription"
            subtitle="We're sorry to see you go"
        >
            <div className="cancel-page">
                <div className="cancel-warning-card">
                    <div className="warning-icon">⚠️</div>
                    <h3>Are you sure you want to cancel?</h3>
                    <p>You will lose access to premium features and your data may be archived.</p>
                </div>

                <div className="cancel-options">
                    <h4>Cancellation Options</h4>
                    <label className="cancel-option">
                        <input
                            type="radio"
                            checked={atPeriodEnd}
                            onChange={() => setAtPeriodEnd(true)}
                        />
                        <div>
                            <strong>Cancel at end of billing period</strong>
                            <p>You'll have access until {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                        </div>
                    </label>
                    <label className="cancel-option">
                        <input
                            type="radio"
                            checked={!atPeriodEnd}
                            onChange={() => setAtPeriodEnd(false)}
                        />
                        <div>
                            <strong>Cancel immediately</strong>
                            <p>Your access will end right away (no refund for unused time)</p>
                        </div>
                    </label>
                </div>

                <div className="cancel-reason">
                    <label>Reason for cancelling (optional)</label>
                    <select value={reason} onChange={(e) => setReason(e.target.value)}>
                        <option value="">Select a reason...</option>
                        <option value="too_expensive">Too expensive</option>
                        <option value="missing_features">Missing features</option>
                        <option value="not_using">Not using enough</option>
                        <option value="switching">Switching to competitor</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="cancel-actions">
                    <button className="btn-secondary" onClick={() => navigate('/subscriptions')}>
                        Keep Subscription
                    </button>
                    <button className="btn-danger" onClick={handleCancel} disabled={submitting}>
                        {submitting ? 'Processing...' : 'Yes, Cancel Subscription'}
                    </button>
                </div>
            </div>
        </BillingLayout>
    );
};

export default CancelPage;