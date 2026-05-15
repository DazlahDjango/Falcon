import React from 'react';
import PropTypes from 'prop-types';

export const DeletePaymentMethodModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    method,
    loading = false 
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getDisplayName = () => {
        if (!method) return '';
        if (method.card_brand && method.card_last4) {
            return `${method.card_brand} ending in ${method.card_last4}`;
        }
        return 'this payment method';
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal delete-payment-modal">
                <div className="modal-header">
                    <h3 className="modal-title">Remove Payment Method</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="delete-payment-warning">
                        <span className="delete-payment-icon">⚠️</span>
                        <p>
                            Are you sure you want to remove {getDisplayName()}?
                        </p>
                    </div>
                    
                    {method?.is_default && (
                        <div className="delete-payment-note">
                            <strong>Note:</strong> This is your default payment method. 
                            You'll need to set a new default after removal.
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="modal-btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="modal-btn-danger"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Removing...' : 'Yes, Remove'}
                    </button>
                </div>
            </div>
        </div>
    );
};

DeletePaymentMethodModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    method: PropTypes.object,
    loading: PropTypes.bool,
};

export default DeletePaymentMethodModal;