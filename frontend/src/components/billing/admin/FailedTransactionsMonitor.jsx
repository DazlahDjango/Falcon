import React, { useState, useEffect } from 'react';
import { useTransactions, useAdminBilling } from '../../../hooks/billing';
import { RefundModal } from './RefundModal';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { StatusBadge } from '../shared/StatusBadge';

export const FailedTransactionsMonitor = () => {
    const { transactions, loading, fetchTransactions, verifyTransaction } = useTransactions();
    const [failedTransactions, setFailedTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const { refundTransaction } = useAdminBilling();

    useEffect(() => {
        fetchTransactions({ status: 'failed' });
    }, []);

    useEffect(() => {
        setFailedTransactions(transactions.filter(t => t.status === 'failed'));
    }, [transactions]);

    const handleVerify = async (transaction) => {
        const result = await verifyTransaction(transaction.reference);
        if (result?.verified) {
            await fetchTransactions({ status: 'failed' });
        }
    };

    const handleRefund = async (transactionId, amount, reason) => {
        await refundTransaction(transactionId, amount, reason);
        setShowRefundModal(false);
        await fetchTransactions({ status: 'failed' });
    };

    if (loading) {
        return <LoadingSkeleton type="list" count={5} />;
    }

    if (failedTransactions.length === 0) {
        return (
            <EmptyState 
                title="No Failed Transactions"
                message="All transactions are processing normally"
                icon="✅"
            />
        );
    }

    return (
        <div className="failed-transactions-monitor">
            <div className="monitor-header">
                <h3>Failed Transactions</h3>
                <span className="badge error">{failedTransactions.length} Failed</span>
            </div>

            <div className="transactions-table-container">
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Reference</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Error</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {failedTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td className="mono">{transaction.reference}</td>
                                <td>KES {((transaction.total_amount || 0) / 100).toLocaleString()}</td>
                                <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                                <td className="error-text">{transaction.error_message || 'Unknown error'}</td>
                                <td><StatusBadge status={transaction.status} /></td>
                                <td className="actions-cell">
                                    <button 
                                        className="action-btn verify"
                                        onClick={() => handleVerify(transaction)}
                                    >
                                        Verify
                                    </button>
                                    <button 
                                        className="action-btn refund"
                                        onClick={() => {
                                            setSelectedTransaction(transaction);
                                            setShowRefundModal(true);
                                        }}
                                    >
                                        Refund
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <RefundModal
                isOpen={showRefundModal}
                onClose={() => setShowRefundModal(false)}
                transaction={selectedTransaction}
                onRefund={handleRefund}
            />
        </div>
    );
};

export default FailedTransactionsMonitor;