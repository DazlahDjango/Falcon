import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutSuccess } from './CheckoutSuccess';

export const CheckoutModal = ({ 
    isOpen, 
    onClose, 
    amount,
    planName,
    onSuccess,
    verified = false,
    loading = false 
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="checkout-modal-overlay" onClick={handleBackdropClick}>
            <div className="checkout-modal">
                <button className="checkout-modal-close" onClick={onClose}>
                    ×
                </button>
                
                {verified ? (
                    <CheckoutSuccess 
                        amount={amount}
                        onClose={onClose}
                    />
                ) : (
                    <CheckoutForm
                        amount={amount}
                        planName={planName}
                        onSubmit={onSuccess}
                        onCancel={onClose}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
};

CheckoutModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    amount: PropTypes.number.isRequired,
    planName: PropTypes.string,
    onSuccess: PropTypes.func.isRequired,
    verified: PropTypes.bool,
    loading: PropTypes.bool,
};

export default CheckoutModal;