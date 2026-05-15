import React from 'react';
import PropTypes from 'prop-types';

export const PaymentMethodSelector = ({ methods, selectedId, onSelect }) => {
    const getCardIcon = (brand) => {
        const icons = {
            visa: '💳',
            mastercard: '💳',
            'american express': '💳',
        };
        return icons[brand?.toLowerCase()] || '💳';
    };

    const formatExpiry = (month, year) => {
        if (!month || !year) return '';
        return `${month}/${year.slice(-2)}`;
    };

    return (
        <div className="payment-method-selector">
            <label className="payment-method-selector-label">Select Payment Method</label>
            <div className="payment-method-selector-options">
                {methods.map((method) => (
                    <div
                        key={method.id}
                        className={`payment-method-option ${selectedId === method.id ? 'payment-method-option-selected' : ''}`}
                        onClick={() => onSelect(method)}
                    >
                        <div className="payment-method-option-radio">
                            <input
                                type="radio"
                                checked={selectedId === method.id}
                                onChange={() => onSelect(method)}
                            />
                        </div>
                        <div className="payment-method-option-icon">
                            {getCardIcon(method.card_brand)}
                        </div>
                        <div className="payment-method-option-details">
                            <div className="payment-method-option-card">
                                {method.card_brand} •••• {method.card_last4}
                            </div>
                            <div className="payment-method-option-expiry">
                                Expires {formatExpiry(method.card_expiry_month, method.card_expiry_year)}
                            </div>
                        </div>
                        {method.is_default && (
                            <span className="payment-method-option-badge">Default</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

PaymentMethodSelector.propTypes = {
    methods: PropTypes.array.isRequired,
    selectedId: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
};

export default PaymentMethodSelector;