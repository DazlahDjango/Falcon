import React from 'react';
import PropTypes from 'prop-types';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';

export const TransactionDetails = ({ transaction, loading, error, onVerify, verifying }) => {
    if (loading) {
        return <LoadingSkeleton type="card" />;
    }

    if (error || !transaction) {
        return (
            <EmptyState 
                title="Transaction not found"
                message="The transaction you're looking for doesn't exist"
                icon="🔍"
            />
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString() + ' at ' + 
               new Date(dateString).toLocaleTimeString();
    };

    const isPending = transaction.status === 'pending';
    const isSuccessful = transaction.status === 'success';
    const isFailed = transaction.status === 'failed';
    const isRefunded = transaction.status === 'refunded';

    const getTypeLabel = () => {
        const labels = {
            subscription: 'Subscription Creation',
            renewal: 'Renewal',
            upgrade: 'Plan Upgrade',
            downgrade: 'Plan Downgrade',
            refund: 'Refund',
            one_time: 'One-time Payment',
        };
        return labels[transaction.transaction_type] || transaction.transaction_type;
    };

    return (
        <div className="transaction-details">
            <div className="transaction-details-header">
                <h2 className="transaction-details-title">Transaction Details</h2>
                <TransactionStatusBadge status={transaction.status} size="large" />
            </div>

            <div className="transaction-details-grid">
                <div className="transaction-details-section">
                    <h4>Transaction Information</h4>
                    <div className="transaction-details-row">
                        <span className="label">Reference:</span>
                        <span className="value">{transaction.reference}</span>
                    </div>
                    <div className="transaction-details-row">
                        <span className="label">PayStack Reference:</span>
                        <span className="value">{transaction.paystack_reference || '—'}</span>
                    </div>
                    <div className="transaction-details-row">
                        <span className="label">Type:</span>
                        <span className="value">{getTypeLabel()}</span>
                    </div>
                    <div className="transaction-details-row">
                        <span className="label">Date:</span>
                        <span className="value">{formatDate(transaction.payment_date || transaction.created_at)}</span>
                    </div>
                </div>

                <div className="transaction-details-section">
                    <h4>Payment Details</h4>
                    <div className="transaction-details-row">
                        <span className="label">Subtotal:</span>
                        <span className="value">KES {((transaction.amount || 0) / 100).toLocaleString()}</span>
                    </div>
                    <div className="transaction-details-row">
                        <span className="label">Tax:</span>
                        <span className="value">KES {((transaction.tax_amount || 0) / 100).toLocaleString()}</span>
                    </div>
                    <div className="transaction-details-row total">
                        <span className="label">Total:</span>
                        <span className="value">
                            KES {((transaction.total_amount || transaction.amount || 0) / 100).toLocaleString()}
                        </span>
                    </div>
                    <div className="transaction-details-row">
                        <span className="label">Currency:</span>
                        <span className="value">{transaction.currency || 'KES'}</span>
                    </div>
                </div>

                <div className="transaction-details-section">
                    <h4>Payment Method</h4>
                    <div className="transaction-details-row">
                        <span className="label">Method:</span>
                        <span className="value">{transaction.payment_method || '—'}</span>
                    </div>
                    {transaction.card_brand && (
                        <div className="transaction-details-row">
                            <span className="label">Card:</span>
                            <span className="value">
                                {transaction.card_brand} •••• {transaction.card_last4}
                            </span>
                        </div>
                    )}
                </div>

                {transaction.subscription && (
                    <div className="transaction-details-section">
                        <h4>Related Subscription</h4>
                        <div className="transaction-details-row">
                            <span className="label">Subscription:</span>
                            <span className="value">{transaction.subscription.subscription_code}</span>
                        </div>
                        <div className="transaction-details-row">
                            <span className="label">Plan:</span>
                            <span className="value">{transaction.subscription.plan?.name}</span>
                        </div>
                    </div>
                )}

                {transaction.invoice && (
                    <div className="transaction-details-section">
                        <h4>Related Invoice</h4>
                        <div className="transaction-details-row">
                            <span className="label">Invoice:</span>
                            <span className="value">{transaction.invoice.invoice_number}</span>
                        </div>
                    </div>
                )}

                {transaction.error_message && (
                    <div className="transaction-details-section error">
                        <h4>Error Message</h4>
                        <p className="transaction-details-error">{transaction.error_message}</p>
                    </div>
                )}
            </div>

            {isPending && (
                <div className="transaction-details-actions">
                    <button 
                        className="transaction-verify-btn-large"
                        onClick={onVerify}
                        disabled={verifying}
                    >
                        {verifying ? 'Verifying...' : 'Verify Transaction'}
                    </button>
                    <p className="transaction-details-note">
                        If this transaction was completed but still shows as pending, click verify to check its status.
                    </p>
                </div>
            )}

            {isFailed && (
                <div className="transaction-details-failed">
                    <span className="failed-icon">⚠️</span>
                    <p>This transaction failed. Please try again or contact support.</p>
                </div>
            )}

            {isSuccessful && (
                <div className="transaction-details-success">
                    <span className="success-icon">✓</span>
                    <p>Transaction completed successfully.</p>
                </div>
            )}
        </div>
    );
};

TransactionDetails.propTypes = {
    transaction: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.string,
    onVerify: PropTypes.func,
    verifying: PropTypes.bool,
};

export default TransactionDetails;