import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const RefundModal = ({ isOpen, onClose, transaction, onRefund }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const maxAmount = transaction?.total_amount || 0;
    const maxAmountDisplay = `KES ${(maxAmount / 100).toLocaleString()}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const refundAmount = amount ? parseFloat(amount) * 100 : maxAmount;
        
        if (refundAmount > maxAmount) {
            setError('Refund amount cannot exceed transaction amount');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onRefund(transaction.id, refundAmount, reason);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to process refund');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal refund-modal">
                <div className="modal-header">
                    <h3 className="modal-title">Process Refund</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="refund-info">
                            <div className="info-row">
                                <span>Transaction:</span>
                                <span>{transaction?.reference}</span>
                            </div>
                            <div className="info-row">
                                <span>Original Amount:</span>
                                <strong>{maxAmountDisplay}</strong>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Refund Amount (optional)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={`Leave empty for full refund (${maxAmountDisplay})`}
                                min="0"
                                max={maxAmount / 100}
                                step="100"
                            />
                        </div>

                        <div className="form-group">
                            <label>Reason for Refund</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason for refund..."
                                rows="3"
                                required
                            />
                        </div>

                        {error && (
                            <div className="form-error">{error}</div>
                        )}

                        <div className="refund-warning">
                            <span>⚠️</span>
                            <p>This action cannot be undone. The refund will be processed via PayStack.</p>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="modal-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn-warning" disabled={loading}>
                            {loading ? 'Processing...' : 'Process Refund'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

RefundModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    transaction: PropTypes.object,
    onRefund: PropTypes.func.isRequired,
};

export default RefundModal;