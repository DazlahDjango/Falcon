import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionCard } from './SubscriptionCard';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useSubscriptions } from '../../../hooks/billing/useSubscriptions';
import './subscription.css';

export const SubscriptionsList = () => {
    const navigate = useNavigate();
    const { subscriptions, loading, fetchAll } = useSubscriptions({ autoFetch: false });

    useEffect(() => { fetchAll({}); }, []);

    if (loading) return <LoadingSkeleton type="card" count={3} />;
    if (!subscriptions.length) return <EmptyState type="subscriptions" actionText="View Plans" onAction={() => navigate('/billing/plans')} />;

    return (
        <div className="subscriptions-list">
            {subscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
        </div>
    );
};

export default SubscriptionsList;