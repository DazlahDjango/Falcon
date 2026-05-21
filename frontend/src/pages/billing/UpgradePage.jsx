import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription, usePlans } from '../../hooks/billing';
import { PlanSelector } from '../../components/billing/plans/PlanSelector';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { BILLING_ROUTES } from '../../config/constants/billingRouteConstants';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';

export const UpgradePage = () => {
    const navigate = useNavigate();
    const { subscription, upgradePlan, loading: subLoading } = useSubscription();
    const { plans, loading: plansLoading } = usePlans({ excludeTrial: true });
    const [upgrading, setUpgrading] = useState(false);

    const handleUpgrade = async (plan, billingCycle) => {
        setUpgrading(true);
        try {
            await upgradePlan(plan.id, false);
            navigate(BILLING_ROUTES.SUBSCRIPTIONS);
        } catch (error) {
            console.error('Upgrade error:', error);
            alert('Failed to upgrade plan. Please try again.');
        } finally {
            setUpgrading(false);
        }
    };

    if (subLoading || plansLoading) {
        return (
            <BillingLayout title="Upgrade Plan">
                <LoadingSkeleton type="card" count={3} />
            </BillingLayout>
        );
    }

    // Filter higher-tier plans only
    const upgradeablePlans = plans.filter(p => {
        const order = { basic: 1, professional: 2, enterprise: 3 };
        return order[p.plan_type] > order[subscription?.plan?.plan_type];
    });

    return (
        <BillingLayout 
            title="Upgrade Your Plan"
            subtitle="Choose a higher-tier plan to unlock more features"
        >
            <PlanSelector 
                plans={upgradeablePlans}
                onSelect={handleUpgrade}
                title="Select a Plan"
                subtitle="Upgrade to get more features and higher limits"
            />
            
            {upgrading && (
                <div className="upgrade-loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Processing upgrade...</p>
                </div>
            )}
        </BillingLayout>
    );
};

export default UpgradePage;