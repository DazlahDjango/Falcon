import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiFilter, FiStar, FiTrendingUp } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { usePlans } from '../../../hooks/billing/usePlans';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { PlanCard } from './PlanCard';
import { PlanComparisonTable } from './PlanComparisonTable';
import { PricingTiers } from './PricingTiers';
import './plans.css';

export const PlansList = () => {
    const navigate = useNavigate();
    const { permissions } = useBillingPermissions();
    const { publicPlans, loading, fetchPublic, fetchComparison, comparison } = usePlans({ autoFetch: false });
    const [viewMode, setViewMode] = useState('grid');
    const [showComparison, setShowComparison] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchPublic(); fetchComparison(); }, [fetchPublic, fetchComparison]);

    const handleRefresh = async () => { setRefreshing(true); await fetchPublic(); await fetchComparison(); setRefreshing(false); };

    if (loading && publicPlans.length === 0) return <LoadingSkeleton type="card" count={3} />;
    if (!publicPlans.length) return <EmptyState type="plans" actionText="No plans available" />;

    const sortedPlans = [...publicPlans].sort((a, b) => a.display_order - b.display_order);
    const professionalPlan = sortedPlans.find(p => p.plan_type === 'professional');

    return (
        <BillingShell title="Subscription Plans" subtitle="Choose the perfect plan for your organization">
            <div className="plans-container">
                <div className="plans-header-actions">
                    <div className="plans-view-toggle">
                        <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>Grid View</button>
                        <button className={`view-toggle-btn ${viewMode === 'comparison' ? 'active' : ''}`} onClick={() => setShowComparison(true)}>Compare Plans</button>
                    </div>
                    <button className="plans-refresh-btn" onClick={handleRefresh} disabled={refreshing}><FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh</button>
                </div>

                {professionalPlan && <div className="plans-popular-badge"><FiStar /> Most Popular</div>}

                {viewMode === 'grid' && (
                    <div className="plans-grid">
                        {sortedPlans.map(plan => (<PlanCard key={plan.id} plan={plan} isPopular={plan.plan_type === 'professional'} onSelect={() => navigate(`/billing/checkout?plan=${plan.id}`)} />))}
                    </div>
                )}

                <PricingTiers plans={sortedPlans} onSelectPlan={(planId) => navigate(`/billing/checkout?plan=${planId}`)} />

                {showComparison && <PlanComparisonTable plans={sortedPlans} onClose={() => setShowComparison(false)} />}
            </div>
        </BillingShell>
    );
};

export default PlansList;