import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import './payment-methods.css';

export const DeletePaymentMethodModal = ({ method, onConfirm, onClose }) => {
    const [confirmText, setConfirmText] = useState('');
    const isDefault = method?.is_default;
    const isLastMethod = false;

    const handleConfirm = () => {
        if (confirmText === 'DELETE') onConfirm();
    };

    return (
        <div className="delete-modal-overlay" onClick={onClose}>
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="delete-modal-header">
                    <FiAlertTriangle className="warning-icon" />
                    <h3>Remove Payment Method</h3>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                <div className="delete-modal-body">
                    <p>Are you sure you want to remove <strong>{method?.display_name}</strong>?</p>
                    {isDefault && <div className="warning-message"><FiAlertTriangle /> This is your default payment method. You will need to set a new default after removal.</div>}
                    {isLastMethod && <div className="error-message"><FiAlertTriangle /> This is your only payment method. Please add another before removing this one.</div>}

                    {!isLastMethod && (
                        <div className="confirm-input">
                            <label>Type <strong>DELETE</strong> to confirm</label>
                            <input type="text" placeholder="DELETE" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
                        </div>
                    )}
                </div>

                <div className="delete-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="delete-btn" onClick={handleConfirm} disabled={!isLastMethod && confirmText !== 'DELETE'}><FiTrash2 /> Remove Payment Method</button>
                </div>
            </div>
        </div>
    );
};

export default DeletePaymentMethodModal;