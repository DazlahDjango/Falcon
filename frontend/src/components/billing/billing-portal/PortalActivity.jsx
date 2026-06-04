import React from 'react';
import { FiActivity, FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import './billing-portal.css';

export const PortalActivity = ({ transactions, loading }) => {
    if (loading) return <LoadingSkeleton type="table" count={1} />;
    if (!transactions?.length) return <EmptyState type="transactions" />;

    const getActivityIcon = (type, status) => {
        if (status === 'success') return <FiCheckCircle className="icon-success" />;
        if (status === 'failed') return <FiXCircle className="icon-failed" />;
        if (status === 'pending') return <FiClock className="icon-pending" />;
        if (type === 'renewal') return <FiRefreshCw />;
        return <FiActivity />;
    };

    const getActivityTitle = (tx) => {
        if (tx.transaction_type === 'subscription') return 'Subscription Created';
        if (tx.transaction_type === 'renewal') return 'Subscription Renewed';
        if (tx.transaction_type === 'upgrade') return `Upgraded to ${tx.metadata?.new_plan || 'new plan'}`;
        if (tx.transaction_type === 'downgrade') return `Downgraded to ${tx.metadata?.new_plan || 'new plan'}`;
        if (tx.transaction_type === 'refund') return 'Refund Processed';
        return 'Payment Processed';
    };

    return (
        <div className="portal-activity">
            <BillingCard title="Recent Activity" icon={<FiActivity />}>
                <div className="activity-timeline">
                    {transactions.map(tx => (
                        <div key={tx.id} className="activity-item">
                            <div className="activity-icon">{getActivityIcon(tx.transaction_type, tx.status)}</div>
                            <div className="activity-content">
                                <div className="activity-title">{getActivityTitle(tx)}</div>
                                <div className="activity-details"><span className="activity-amount"><CurrencyFormatter amount={tx.total_amount} currency={tx.currency} /></span><span className="activity-date">{new Date(tx.created_at).toLocaleDateString()}</span></div>
                                <div className="activity-reference">Reference: {tx.reference?.slice(-12)}</div>
                            </div>
                            <div className="activity-status"><StatusBadge type="transaction" status={tx.status} size="sm" /></div>
                        </div>
                    ))}
                </div>
            </BillingCard>
        </div>
    );
};

export default PortalActivity;