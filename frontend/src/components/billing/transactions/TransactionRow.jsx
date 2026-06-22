import React from 'react';
import { FiEye } from 'react-icons/fi';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './transactions.css';

export const TransactionRow = ({ transaction, onViewDetails }) => {
    const getTypeDisplay = (type) => {
        const types = { subscription: 'Subscription', renewal: 'Renewal', upgrade: 'Upgrade', downgrade: 'Downgrade', refund: 'Refund', one_time: 'One Time' };
        return types[type] || type;
    };

    const getMethodDisplay = (method) => {
        if (method === 'card') return '💳 Card';
        if (method === 'bank') return '🏦 Bank';
        if (method === 'mobile_money') return '📱 Mobile Money';
        return method || 'N/A';
    };

    return (
        <tr className={`transaction-row ${transaction.status}`}>
            <td className="transaction-reference-cell">
                <span className="reference">{transaction.reference?.slice(-12)}</span>
                <span className="reference-full" title={transaction.reference}>{transaction.reference}</span>
            </td>
            <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
            <td><span className="transaction-type">{getTypeDisplay(transaction.transaction_type)}</span></td>
            <td className="transaction-amount-cell"><CurrencyFormatter amount={transaction.total_amount} currency={transaction.currency} /></td>
            <td><StatusBadge type="transaction" status={transaction.status} size="sm" /></td>
            <td className="transaction-method">{getMethodDisplay(transaction.payment_method)}</td>
            <td className="transaction-actions-cell">
                <button className="view-details-btn" onClick={onViewDetails} title="View Details"><FiEye /></button>
            </td>
        </tr>
    );
};

export default TransactionRow;