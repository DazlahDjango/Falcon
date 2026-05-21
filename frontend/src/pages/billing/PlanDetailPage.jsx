import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlans } from '../../hooks/billing';
import { PlanFeatureList } from '../../components/billing/plans/PlanFeatureList';
import { PriceDisplay } from '../../components/billing/shared/PriceDisplay';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { BILLING_ROUTES } from '../../config/constants/billingRouteConstants';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';
import { EmptyState } from '../../components/billing/shared/EmptyState';

export const PlanDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { plans, loading, billingCycle, setBillingCycle } = usePlans();
    
    const plan = plans.find(p => p.id === id);
    const isLoading = loading && !plan;

    const getPrice = () => {
        if (billingCycle === 'yearly' && plan?.yearly_price) {
            return plan.yearly_price;
        }
        return plan?.price;
    };

    const getPeriod = () => billingCycle === 'yearly' ? 'year' : 'month';

    const handleSelect = () => {
        navigate(BILLING_ROUTES.CHECKOUT, { state: { plan, billingCycle } });
    };

    if (isLoading) {
        return (
            <BillingLayout title="Plan Details">
                <LoadingSkeleton type="card" />
            </BillingLayout>
        );
    }

    if (!plan) {
        return (
            <BillingLayout title="Plan Not Found">
                <EmptyState 
                    title="Plan not found"
                    message="The plan you're looking for doesn't exist"
                    icon="🔍"
                    action={
                        <button onClick={() => navigate(BILLING_ROUTES.PLANS)} className="btn-primary">
                            View All Plans
                        </button>
                    }
                />
            </BillingLayout>
        );
    }

    return (
        <BillingLayout title={plan.name} subtitle={plan.description}>
            <div className="plan-detail-page">
                <div className="plan-detail-header">
                    <div className="plan-detail-pricing">
                        <PriceDisplay amount={getPrice()} period={getPeriod()} size="xlarge" />
                        {billingCycle === 'yearly' && plan.yearly_price && (
                            <div className="plan-detail-savings">
                                Save {Math.round(((plan.price * 12 - plan.yearly_price) / (plan.price * 12)) * 100)}% with yearly billing
                            </div>
                        )}
                    </div>
                    <div className="plan-detail-actions">
                        <div className="billing-cycle-toggle">
                            <button 
                                className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Monthly
                            </button>
                            <button 
                                className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                                onClick={() => setBillingCycle('yearly')}
                            >
                                Yearly
                            </button>
                        </div>
                        <button className="select-plan-btn" onClick={handleSelect}>
                            {plan.plan_type === 'trial' ? 'Start Free Trial' : 'Select Plan'}
                        </button>
                    </div>
                </div>

                <div className="plan-detail-features">
                    <h3>All features included</h3>
                    <PlanFeatureList plan={plan} showAll={true} />
                </div>

                {plan.plan_type === 'enterprise' && (
                    <div className="plan-detail-contact">
                        <h4>Need a custom solution?</h4>
                        <p>Contact our sales team for enterprise pricing and custom features.</p>
                        <button className="contact-sales-btn">Contact Sales</button>
                    </div>
                )}
            </div>
        </BillingLayout>
    );
};

export default PlanDetailPage;