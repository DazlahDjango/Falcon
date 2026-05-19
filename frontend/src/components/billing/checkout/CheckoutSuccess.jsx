import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

export const CheckoutSuccess = ({ amount, onClose }) => {
    const navigate = useNavigate();

    const handleViewSubscription = () => {
        navigate('/subscriptions');
        onClose();
    };

    const handleGoHome = () => {
        navigate('/dashboard');
        onClose();
    };

    return (
        <div className="checkout-success">
            <div className="checkout-success-icon">
                <span role="img" aria-label="success">🎉</span>
            </div>
            <h2 className="checkout-success-title">Payment Successful!</h2>
            <p className="checkout-success-message">
                Your payment of <strong>KES {(amount / 100).toLocaleString()}</strong> has been processed successfully.
            </p>
            <div className="checkout-success-actions">
                <button 
                    className="checkout-success-btn-primary"
                    onClick={handleViewSubscription}
                >
                    View Subscription
                </button>
                <button 
                    className="checkout-success-btn-secondary"
                    onClick={handleGoHome}
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};

CheckoutSuccess.propTypes = {
    amount: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default CheckoutSuccess;