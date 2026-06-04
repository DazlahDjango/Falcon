import React, { useEffect } from 'react';
import { FiX, FiCreditCard, FiDollarSign, FiCalendar, FiShield, FiLock } from 'react-icons/fi';
import { useCheckout } from '../../../hooks/billing/useCheckout';
import { usePlans } from '../../../hooks/billing/usePlans';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import './checkout.css';

export const CheckoutModal = ({ isOpen, onClose, planId, amount, description, onSuccess }) => {
    const { initSubscription, initOneTime, loading, error, clearCheckoutError } = useCheckout();
    const { getPlanById, plans, loading: plansLoading, fetchPublicPlans } = usePlans();
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && planId && !plans.length) fetchPublicPlans();
    }, [isOpen, planId, plans.length, fetchPublicPlans]);

    useEffect(() => {
        if (!isOpen) { clearCheckoutError(); setProcessing(false); setSelectedMethod(null); }
    }, [isOpen, clearCheckoutError]);

    const plan = planId ? getPlanById(planId) : null;
    const displayAmount = amount || plan?.price || 0;
    const displayCurrency = plan?.currency || 'KES';
    const displayDescription = description || `${plan?.name} Plan Subscription`;

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            let result;
            if (planId) result = await initSubscription({ planId, billingInterval: 'monthly', successUrl: window.location.origin + '/billing/checkout/success', cancelUrl: window.location.origin + '/billing/checkout/cancel', metadata: { source: 'checkout_modal' } });
            else result = await initOneTime({ amount, description, successUrl: window.location.origin + '/payment/success', cancelUrl: window.location.origin + '/payment/cancelled', metadata: { source: 'checkout_modal' } });
            if (result?.authorization_url) { window.location.href = result.authorization_url; if (onSuccess) onSuccess(result); }
        } catch (err) { console.error('Checkout failed:', err); }
        finally { setProcessing(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="checkout-modal-overlay" onClick={onClose}>
            <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
                <div className="checkout-modal-header">
                    <h3>Complete Checkout</h3>
                    <button className="checkout-modal-close" onClick={onClose}><FiX /></button>
                </div>

                <div className="checkout-modal-body">
                    {plansLoading && planId ? <LoadingSkeleton type="card" count={1} /> : (
                        <>
                            <div className="checkout-order-summary">
                                <h4>Order Summary</h4>
                                <div className="order-item"><span className="order-label">Item</span><span className="order-value">{displayDescription}</span></div>
                                <div className="order-item"><span className="order-label">Amount</span><span className="order-value price"><CurrencyFormatter amount={displayAmount} currency={displayCurrency} /></span></div>
                                {plan && plan.billing_interval && (<div className="order-item"><span className="order-label">Billing</span><span className="order-value">{plan.billing_interval === 'monthly' ? 'Monthly' : 'Yearly'}</span></div>)}
                                {plan && plan.trial_days > 0 && (<div className="order-item trial"><span className="order-label">Trial</span><span className="order-value">{plan.trial_days} days free</span></div>)}
                                <div className="order-total"><span>Total Due Today</span><span><CurrencyFormatter amount={displayAmount} currency={displayCurrency} /></span></div>
                            </div>

                            <PaymentMethodSelector selectedMethod={selectedMethod} onSelect={setSelectedMethod} />

                            {error && <div className="checkout-error"><FiAlertCircle /> {error}</div>}

                            <div className="checkout-security-info">
                                <div className="security-item"><FiLock /> Payment secured by PayStack</div>
                                <div className="security-item"><FiShield /> Your payment info is encrypted</div>
                            </div>
                        </>
                    )}
                </div>

                <div className="checkout-modal-footer">
                    <button className="checkout-cancel-btn" onClick={onClose}>Cancel</button>
                    <CheckoutButton onClick={handleCheckout} loading={processing || loading} disabled={processing || loading}>Pay Now</CheckoutButton>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;