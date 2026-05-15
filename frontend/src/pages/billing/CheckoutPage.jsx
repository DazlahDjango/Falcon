import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCheckout, usePaymentMethods } from '../../hooks/billing';
import { CheckoutForm } from '../../components/billing/checkout/CheckoutForm';
import { BillingLayout } from '../../components/billing/shared/BillingLayout';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';

export const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan, billingCycle } = location.state || {};
    
    const [loading, setLoading] = useState(false);
    const { initSubscriptionCheckout, redirectToPayment } = useCheckout();
    const { paymentMethods, fetchPaymentMethods } = usePaymentMethods();

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    if (!plan) {
        navigate('/plans');
        return null;
    }

    const amount = billingCycle === 'yearly' && plan.yearly_price 
        ? plan.yearly_price 
        : plan.price;

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            const result = await initSubscriptionCheckout({
                planId: plan.id,
                billingInterval: billingCycle,
                paymentMethodId: data.paymentMethodId,
                metadata: {
                    plan_name: plan.name,
                    billing_cycle: billingCycle,
                },
            });
            
            if (result?.authorization_url) {
                redirectToPayment(result.authorization_url);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to initialize payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BillingLayout 
            title="Complete Your Purchase"
            subtitle={`${plan.name} Plan - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Billing`}
        >
            <div className="checkout-page">
                <div className="checkout-page-grid">
                    <div className="checkout-form-container">
                        <CheckoutForm 
                            amount={amount}
                            planName={plan.name}
                            onSubmit={handleSubmit}
                            onCancel={() => navigate('/plans')}
                            loading={loading}
                        />
                    </div>
                    
                    <div className="checkout-summary">
                        <div className="summary-card">
                            <h3>Order Summary</h3>
                            <div className="summary-item">
                                <span>{plan.name} Plan</span>
                                <span>KES {(amount / 100).toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                                <span>Billing Cycle</span>
                                <span>{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-total">
                                <span>Total Due Today</span>
                                <span className="total-amount">KES {(amount / 100).toLocaleString()}</span>
                            </div>
                            {billingCycle === 'yearly' && plan.yearly_price && (
                                <div className="summary-savings">
                                    You save KES {((plan.price * 12 - plan.yearly_price) / 100).toLocaleString()} with yearly billing
                                </div>
                            )}
                        </div>
                        
                        <div className="summary-features">
                            <h4>What's included:</h4>
                            <ul>
                                <li>✓ Up to {plan.max_users === -1 ? 'unlimited' : plan.max_users} users</li>
                                <li>✓ Up to {plan.max_kpis === -1 ? 'unlimited' : plan.max_kpis} KPIs</li>
                                {plan.custom_branding && <li>✓ Custom branding</li>}
                                {plan.api_access && <li>✓ API access</li>}
                                {plan.advanced_analytics && <li>✓ Advanced analytics</li>}
                                <li>✓ 24/7 support</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </BillingLayout>
    );
};

export default CheckoutPage;