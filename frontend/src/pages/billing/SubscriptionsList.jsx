import React, { useEffect } from 'react';
import { BillingShell } from '../../components/billing/common/BillingShell';
import { SubscriptionCard } from '../../components/billing/subscription';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';
import { EmptyState } from '../../components/billing/shared/EmptyState';
import { useSubscriptions } from '../../hooks/billing/useSubscriptions';

const SubscriptionsList = () => {
    const { subscriptions, loading, fetchAll } = useSubscriptions({ autoFetch: false });

    useEffect(() => { fetchAll({}); }, []);

    if (loading) return <LoadingSkeleton type="card" count={3} />;
    if (!subscriptions.length) return <EmptyState type="subscriptions" />;

    return (
        <BillingShell title="Subscriptions" subtitle="View and manage all your subscriptions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {subscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
            </div>
        </BillingShell>
    );
};

export default SubscriptionsList;