import React, { useState, useEffect, useCallback } from 'react';
import { FiAlertCircle, FiRefreshCw, FiRotateCcw, FiCheckCircle, FiClock } from 'react-icons/fi';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useTransactions } from '../../../hooks/billing/useTransactions';
import './admin.css';

export const FailedTransactionsMonitor = () => {
    const { transactions, loading, fetchAll, verify, refund } = useTransactions({ autoFetch: true });
    const [retrying, setRetrying] = useState(null);
    const [refunding, setRefunding] = useState(null);

    const failedTransactions = transactions?.filter(t => t.status === 'failed' || t.status === 'disputed') || [];
    const pendingTransactions = transactions?.filter(t => t.status === 'pending') || [];

    const handleRetry = async (id) => {
        setRetrying(id);
        await verify(transactions.find(t => t.id === id)?.reference);
        await fetchAll({});
        setRetrying(null);
    };

    const handleRefund = async (id) => {
        if (!window.confirm('Are you sure you want to refund this transaction?')) return;
        setRefunding(id);
        await refund(id);
        await fetchAll({});
        setRefunding(null);
    };

    if (loading) return <LoadingSkeleton type="table" count={1} />;

    const hasIssues = failedTransactions.length > 0 || pendingTransactions.length > 0;

    return (
        <BillingCard title="Payment Issues Monitor" icon={<FiAlertCircle />} className={hasIssues ? 'has-issues' : ''}>
            {!hasIssues ? (
                <div className="monitor-success"><FiCheckCircle /> All transactions are processing normally</div>
            ) : (
                <div className="monitor-list">
                    {failedTransactions.map(tx => (
                        <div key={tx.id} className="monitor-item failed">
                            <div className="monitor-info"><span className="monitor-ref">{tx.reference?.slice(-12)}</span><StatusBadge type="transaction" status={tx.status} size="sm" /><span className="monitor-amount"><CurrencyFormatter amount={tx.total_amount} /></span></div>
                            <div className="monitor-error">{tx.error_message || 'Payment failed'}</div>
                            <div className="monitor-actions"><button className="monitor-action retry" onClick={() => handleRetry(tx.id)} disabled={retrying === tx.id}>{retrying === tx.id ? <FiRefreshCw className="spin" /> : <FiRotateCcw />} Retry</button><button className="monitor-action refund" onClick={() => handleRefund(tx.id)} disabled={refunding === tx.id}>Refund</button></div>
                        </div>
                    ))}
                    {pendingTransactions.map(tx => (
                        <div key={tx.id} className="monitor-item pending">
                            <div className="monitor-info"><span className="monitor-ref">{tx.reference?.slice(-12)}</span><StatusBadge type="transaction" status={tx.status} size="sm" /><span className="monitor-amount"><CurrencyFormatter amount={tx.total_amount} /></span></div>
                            <div className="monitor-error">Awaiting payment confirmation</div>
                            <div className="monitor-actions"><button className="monitor-action retry" onClick={() => handleRetry(tx.id)} disabled={retrying === tx.id}>{retrying === tx.id ? <FiRefreshCw className="spin" /> : <FiRotateCcw />} Check Status</button></div>
                        </div>
                    ))}
                </div>
            )}
        </BillingCard>
    );
};

export default FailedTransactionsMonitor;