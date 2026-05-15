import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSubscription } from '../../../hooks/billing';
import { usePaymentMethods } from '../../../hooks/billing';

export const RenewSubscriptionButton = ({ subscription, onSuccess, variant = 'primary' }) => {
    const [loading, setLoading] = useState(false);
    const { renewSubscription } = useSubscription();
    const { paymentMethods, fetchPaymentMethods } = usePaymentMethods();

    const handleRenew = async () => {
        setLoading(true);
        try {
            // Fetch latest payment methods
            await fetchPaymentMethods();
            
            const defaultMethod = paymentMethods.find(m => m.is_default);
            
            await renewSubscription(subscription.id, defaultMethod?.id);
            onSuccess?.();
        } catch (error) {
            console.error('[RenewSubscriptionButton] Error:', error);
            alert('Failed to renew subscription. Please add a payment method.');
        } finally {
            setLoading(false);
        }
    };

    const variants = {
        primary: 'renew-btn-primary',
        secondary: 'renew-btn-secondary',
        outline: 'renew-btn-outline',
    };

    return (
        <button
            className={`renew-btn ${variants[variant]} ${loading ? 'renew-btn-loading' : ''}`}
            onClick={handleRenew}
            disabled={loading}
        >
            {loading ? 'Processing...' : 'Renew Now'}
        </button>
    );
};

RenewSubscriptionButton.propTypes = {
    subscription: PropTypes.object.isRequired,
    onSuccess: PropTypes.func,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
};

export default RenewSubscriptionButton;