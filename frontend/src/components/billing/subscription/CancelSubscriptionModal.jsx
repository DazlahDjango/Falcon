import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSubscription } from '../../../hooks/billing';

export const CancelSubscriptionModal = ({ isOpen, onClose, subscription, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [atPeriodEnd, setAtPeriodEnd] = useState(true);
    const [loading, setLoading] = useState(false);
    const { cancelSubscription } = useSubscription();

    if (!isOpen) return null;

    const handleCancel = async () => {
        setLoading(true);
        try {
            await cancelSubscription(subscription.id, { 
                at_period_end: atPeriodEnd, 
                reason 
            });
            onSuccess?.();
        } catch (error) {
            console.error('[CancelSubscriptionModal] Error:', error);
            alert('Failed to cancel subscription. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal cancel-modal">
                <div className="modal-header">
                    <h3 className="modal-title">Cancel Subscription</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="cancel-modal-warning">
                        <span className="cancel-modal-warning-icon">⚠️</span>
                        <p>
                            Are you sure you want to cancel your {subscription?.plan?.name} subscription?
                        </p>
                    </div>

                    <div className="cancel-modal-options">
                        <label className="cancel-modal-option">
                            <input
                                type="radio"
                                checked={atPeriodEnd}
                                onChange={() => setAtPeriodEnd(true)}
                            />
                            <div>
                                <strong>Cancel at end of billing period</strong>
                                <p>You'll have access until {new Date(subscription?.current_period_end).toLocaleDateString()}</p>
                            </div>
                        </label>
                        <label className="cancel-modal-option">
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

                    <div className="cancel-modal-reason">
                        <label className="cancel-modal-label">Reason for cancelling (optional)</label>
                        <select 
                            className="cancel-modal-select"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            <option value="">Select a reason...</option>
                            <option value="too_expensive">Too expensive</option>
                            <option value="missing_features">Missing features</option>
                            <option value="not_using">Not using enough</option>
                            <option value="switching">Switching to competitor</option>
                            <option value="other">Other</option>
                        </select>
                        {reason === 'other' && (
                            <textarea
                                className="cancel-modal-textarea"
                                placeholder="Please tell us why..."
                                value={reason === 'other' ? reason : ''}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn-secondary" onClick={onClose}>
                        Keep Subscription
                    </button>
                    <button 
                        className="modal-btn-danger"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Yes, Cancel Subscription'}
                    </button>
                </div>
            </div>
        </div>
    );
};

CancelSubscriptionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    subscription: PropTypes.object.isRequired,
    onSuccess: PropTypes.func,
};

export default CancelSubscriptionModal;