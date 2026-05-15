import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { BillingAddressForm } from './BillingAddressForm';
import { usePaymentMethods } from '../../../hooks/billing';

export const CheckoutForm = ({ 
    amount, 
    planName,
    onSubmit,
    onCancel,
    loading = false 
}) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [billingAddress, setBillingAddress] = useState({});
    const [useNewCard, setUseNewCard] = useState(false);
    const { paymentMethods, loading: methodsLoading } = usePaymentMethods();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            paymentMethodId: selectedMethod?.id,
            useNewCard,
            billingAddress,
        });
    };

    const hasSavedMethods = paymentMethods && paymentMethods.length > 0;

    return (
        <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-form-header">
                <h3 className="checkout-form-title">Complete Payment</h3>
                {planName && (
                    <div className="checkout-form-plan">
                        <span className="checkout-form-plan-label">Plan:</span>
                        <span className="checkout-form-plan-name">{planName}</span>
                    </div>
                )}
                <div className="checkout-form-amount">
                    <span className="checkout-form-amount-label">Amount:</span>
                    <span className="checkout-form-amount-value">
                        KES {(amount / 100).toLocaleString()}
                    </span>
                </div>
            </div>

            {hasSavedMethods && (
                <div className="checkout-form-section">
                    <label className="checkout-form-label">Payment Method</label>
                    <div className="checkout-form-radio-group">
                        <label className="checkout-form-radio">
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={!useNewCard}
                                onChange={() => setUseNewCard(false)}
                            />
                            <span>Use saved card</span>
                        </label>
                        <label className="checkout-form-radio">
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={useNewCard}
                                onChange={() => setUseNewCard(true)}
                            />
                            <span>Use new card</span>
                        </label>
                    </div>
                </div>
            )}

            {!useNewCard && hasSavedMethods && (
                <div className="checkout-form-section">
                    <PaymentMethodSelector
                        methods={paymentMethods}
                        selectedId={selectedMethod?.id}
                        onSelect={setSelectedMethod}
                    />
                </div>
            )}

            <div className="checkout-form-section">
                <BillingAddressForm
                    value={billingAddress}
                    onChange={setBillingAddress}
                />
            </div>

            <div className="checkout-form-actions">
                <button
                    type="button"
                    className="checkout-form-cancel"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="checkout-form-submit"
                    disabled={loading || (!useNewCard && !selectedMethod)}
                >
                    {loading ? 'Processing...' : `Pay KES ${(amount / 100).toLocaleString()}`}
                </button>
            </div>
        </form>
    );
};

CheckoutForm.propTypes = {
    amount: PropTypes.number.isRequired,
    planName: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

export default CheckoutForm;