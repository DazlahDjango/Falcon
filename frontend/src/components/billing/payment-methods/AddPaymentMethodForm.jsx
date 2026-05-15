import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { usePaymentMethods } from '../../../hooks/billing';

export const AddPaymentMethodForm = ({ onSuccess, onCancel }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { addPaymentMethod } = usePaymentMethods();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // This would typically redirect to PayStack to add a card
            // For now, we'll simulate using a test auth code
            const testAuthCode = 'AUTH_test_' + Date.now();
            await addPaymentMethod(testAuthCode, email);
            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to add payment method');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-payment-method-form">
            <div className="add-payment-method-header">
                <h4>Add New Payment Method</h4>
                <button className="add-payment-method-close" onClick={onCancel}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="add-payment-method-card-preview">
                    <div className="card-preview">
                        <div className="card-preview-chip">💳</div>
                        <div className="card-preview-number">•••• •••• •••• ••••</div>
                        <div className="card-preview-details">
                            <div className="card-preview-expiry">MM/YY</div>
                            <div className="card-preview-brand">Card</div>
                        </div>
                    </div>
                </div>

                <div className="add-payment-method-form-group">
                    <label className="add-payment-method-label">Email Address</label>
                    <input
                        type="email"
                        className="add-payment-method-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                    <p className="add-payment-method-hint">
                        We'll send a verification link to this email
                    </p>
                </div>

                {error && (
                    <div className="add-payment-method-error">
                        {error}
                    </div>
                )}

                <div className="add-payment-method-actions">
                    <button
                        type="button"
                        className="add-payment-method-cancel"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="add-payment-method-submit"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Add Payment Method'}
                    </button>
                </div>

                <p className="add-payment-method-secure">
                    🔒 Your payment info is securely encrypted
                </p>
            </form>
        </div>
    );
};

AddPaymentMethodForm.propTypes = {
    onSuccess: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default AddPaymentMethodForm;