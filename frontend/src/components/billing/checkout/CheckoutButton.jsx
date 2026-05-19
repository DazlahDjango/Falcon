import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useCheckout } from '../../../hooks/billing';

export const CheckoutButton = ({ 
    planId, 
    billingCycle = 'monthly',
    amount = null,
    description = null,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    onSuccess,
    onError,
    children 
}) => {
    const [loading, setLoading] = useState(false);
    const { initSubscriptionCheckout, initOneTimeCheckout, redirectToPayment } = useCheckout();

    const handleCheckout = async () => {
        setLoading(true);
        try {
            let result;
            
            if (planId) {
                // Subscription checkout
                result = await initSubscriptionCheckout({
                    planId,
                    billingInterval: billingCycle,
                });
            } else if (amount) {
                // One-time checkout
                result = await initOneTimeCheckout({
                    amount,
                    description: description || 'Payment',
                });
            } else {
                throw new Error('Either planId or amount is required');
            }

            if (result?.authorization_url) {
                redirectToPayment(result.authorization_url);
                onSuccess?.(result);
            }
        } catch (error) {
            console.error('[CheckoutButton] Error:', error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    const variants = {
        primary: 'checkout-btn-primary',
        secondary: 'checkout-btn-secondary',
        outline: 'checkout-btn-outline',
    };

    const sizes = {
        small: 'checkout-btn-small',
        medium: 'checkout-btn-medium',
        large: 'checkout-btn-large',
    };

    return (
        <button
            className={`checkout-btn ${variants[variant]} ${sizes[size]} ${loading ? 'checkout-btn-loading' : ''}`}
            onClick={handleCheckout}
            disabled={disabled || loading}
        >
            {loading ? (
                <span className="checkout-btn-spinner"></span>
            ) : (
                children || (planId ? 'Subscribe Now' : 'Pay Now')
            )}
        </button>
    );
};

CheckoutButton.propTypes = {
    planId: PropTypes.string,
    billingCycle: PropTypes.oneOf(['monthly', 'yearly']),
    amount: PropTypes.number,
    description: PropTypes.string,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    disabled: PropTypes.bool,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    children: PropTypes.node,
};

export default CheckoutButton;