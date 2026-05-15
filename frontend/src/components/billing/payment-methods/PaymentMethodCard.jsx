import React from 'react';
import PropTypes from 'prop-types';
import { DefaultPaymentMethodBadge } from './DefaultPaymentMethodBadge';

export const PaymentMethodCard = ({ 
    method, 
    isDefault, 
    onSetDefault, 
    onDelete,
    deleting = false,
    settingDefault = false 
}) => {
    const getCardIcon = () => {
        const icons = {
            visa: '💳',
            mastercard: '💳',
            'american express': '💳',
            discover: '💳',
        };
        return icons[method.card_brand?.toLowerCase()] || '💳';
    };

    const getCardColor = () => {
        const colors = {
            visa: '#1A1F71',
            mastercard: '#EB001B',
            'american express': '#2E77BC',
            discover: '#FF6000',
        };
        return colors[method.card_brand?.toLowerCase()] || '#6B7280';
    };

    const isExpired = () => {
        if (!method.card_expiry_year || !method.card_expiry_month) return false;
        const expiryDate = new Date(
            parseInt(method.card_expiry_year),
            parseInt(method.card_expiry_month) - 1,
            1
        );
        return expiryDate < new Date();
    };

    const formatExpiry = () => {
        if (!method.card_expiry_month || !method.card_expiry_year) return '';
        return `${method.card_expiry_month}/${method.card_expiry_year.slice(-2)}`;
    };

    const getMaskedNumber = () => {
        if (!method.card_last4) return '•••• •••• •••• ••••';
        return `•••• •••• •••• ${method.card_last4}`;
    };

    return (
        <div className={`payment-method-card ${isDefault ? 'payment-method-card-default' : ''}`}>
            <div className="payment-method-card-left">
                <div 
                    className="payment-method-card-icon"
                    style={{ backgroundColor: getCardColor() }}
                >
                    <span>{getCardIcon()}</span>
                </div>
                <div className="payment-method-card-info">
                    <div className="payment-method-card-brand">
                        {method.card_brand || 'Card'}
                        {isDefault && <DefaultPaymentMethodBadge />}
                        {isExpired() && (
                            <span className="payment-method-expired-badge">Expired</span>
                        )}
                    </div>
                    <div className="payment-method-card-number">
                        {getMaskedNumber()}
                    </div>
                    <div className="payment-method-card-expiry">
                        Expires {formatExpiry()}
                    </div>
                </div>
            </div>
            <div className="payment-method-card-actions">
                {!isDefault && !isExpired() && (
                    <button
                        className="payment-method-set-default-btn"
                        onClick={onSetDefault}
                        disabled={settingDefault}
                    >
                        {settingDefault ? '...' : 'Set as Default'}
                    </button>
                )}
                <button
                    className="payment-method-delete-btn"
                    onClick={onDelete}
                    disabled={deleting}
                >
                    {deleting ? '...' : 'Remove'}
                </button>
            </div>
        </div>
    );
};

PaymentMethodCard.propTypes = {
    method: PropTypes.object.isRequired,
    isDefault: PropTypes.bool,
    onSetDefault: PropTypes.func,
    onDelete: PropTypes.func,
    deleting: PropTypes.bool,
    settingDefault: PropTypes.bool,
};

export default PaymentMethodCard;