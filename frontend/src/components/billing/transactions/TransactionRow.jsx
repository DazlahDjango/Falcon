import React from 'react';
import PropTypes from 'prop-types';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { renderBillingIcon } from '../shared/BillingIcons';

export const TransactionRow = ({ transaction, onClick, onVerify, verifying }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString() + ' ' + 
               new Date(dateString).toLocaleTimeString();
    };

    const getAmountClass = () => {
        if (transaction.transaction_type === 'refund') return 'transaction-amount-refund';
        if (transaction.status === 'success') return 'transaction-amount-success';
        if (transaction.status === 'failed') return 'transaction-amount-failed';
        return '';
    };

    const getTypeIcon = () => {
        const icons = {
            subscription: renderBillingIcon('subscriptionCreate', { size: 16 }),
            renewal: renderBillingIcon('renewal', { size: 16 }),
            upgrade: renderBillingIcon('upgrade', { size: 16 }),
            downgrade: renderBillingIcon('downgrade', { size: 16 }),
            refund: renderBillingIcon('refund', { size: 16 }),
            one_time: renderBillingIcon('card', { size: 16 }),
        };
        return icons[transaction.transaction_type] || renderBillingIcon('card', { size: 16 });
    };

    const getTypeLabel = () => {
        const labels = {
            subscription: 'Subscription',
            renewal: 'Renewal',
            upgrade: 'Upgrade',
            downgrade: 'Downgrade',
            refund: 'Refund',
            one_time: 'One-time',
        };
        return labels[transaction.transaction_type] || transaction.transaction_type;
    };

    const isPending = transaction.status === 'pending';

    return (
        <div className={`transaction-row ${onClick ? 'transaction-row-clickable' : ''}`} onClick={onClick}>
            <div className="transaction-cell-reference">
                <span className="transaction-reference">{transaction.reference}</span>
                <span className="transaction-type">
                    <span className="transaction-type-icon">{getTypeIcon()}</span>
                    {getTypeLabel()}
                </span>
            </div>
            <div className="transaction-cell-date">
                {formatDate(transaction.payment_date || transaction.created_at)}
            </div>
            <div className="transaction-cell-amount">
                <span className={`transaction-amount ${getAmountClass()}`}>
                    {transaction.transaction_type === 'refund' ? '-' : ''}
                    KES {((transaction.total_amount || transaction.amount || 0) / 100).toLocaleString()}
                </span>
            </div>
            <div className="transaction-cell-status">
                <TransactionStatusBadge status={transaction.status} />
            </div>
            <div className="transaction-cell-actions" onClick={(e) => e.stopPropagation()}>
                {isPending && (
                    <button 
                        className="transaction-verify-btn"
                        onClick={onVerify}
                        disabled={verifying}
                    >
                        {verifying ? '...' : 'Verify'}
                    </button>
                )}
            </div>
        </div>
    );
};

TransactionRow.propTypes = {
    transaction: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    onVerify: PropTypes.func,
    verifying: PropTypes.bool,
};

export default TransactionRow;