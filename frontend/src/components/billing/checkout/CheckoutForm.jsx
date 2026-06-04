import React, { useState, useEffect } from 'react';
import { FiMail, FiUser, FiPhone, FiMapPin, FiBuilding, FiCreditCard, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useCheckout } from '../../../hooks/billing/useCheckout';
import { usePlans } from '../../../hooks/billing/usePlans';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { PriceDisplay } from '../shared/PriceDisplay';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import './checkout.css';

export const CheckoutForm = ({ planId, onSuccess, onCancel, redirectToPaystack = true }) => {
    const { initSubscription, loading, error, clearCheckoutError } = useCheckout();
    const { getPlanById, plans, loading: plansLoading, fetchPublicPlans } = usePlans();
    const [formData, setFormData] = useState({ email: '', fullName: '', phone: '', companyName: '', address: '', city: '', country: 'KE', taxId: '' });
    const [formErrors, setFormErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [billingInterval, setBillingInterval] = useState('monthly');

    useEffect(() => {
        if (planId && !plans.length) fetchPublicPlans();
    }, [planId, plans.length, fetchPublicPlans]);

    useEffect(() => { clearCheckoutError(); }, [clearCheckoutError]);

    const plan = getPlanById(planId);
    const displayPrice = billingInterval === 'monthly' ? plan?.price : plan?.yearly_price || plan?.price * 10;
    const savings = billingInterval === 'yearly' && plan?.yearly_price ? Math.round(((plan.price * 12) - plan.yearly_price) / (plan.price * 12) * 100) : 0;

    const validateForm = () => {
        const errors = {};
        if (!formData.email) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
        if (!formData.fullName) errors.fullName = 'Full name is required';
        if (!formData.companyName) errors.companyName = 'Company name is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setProcessing(true);
        try {
            const result = await initSubscription({ planId, billingInterval, successUrl: window.location.origin + '/billing/checkout/success', cancelUrl: window.location.origin + '/billing/checkout/cancel', metadata: { ...formData, source: 'checkout_form' } });
            if (result?.authorization_url) { if (redirectToPaystack) window.location.href = result.authorization_url; else if (onSuccess) onSuccess(result); }
            else if (onSuccess) onSuccess(result);
        } catch (err) { console.error('Checkout failed:', err); }
        finally { setProcessing(false); }
    };

    if (plansLoading) return <LoadingSkeleton type="card" count={1} />;
    if (!plan) return <div className="checkout-error-state">Plan not found. Please select a valid plan.</div>;

    const countries = [{ code: 'KE', name: 'Kenya', tax: '16% VAT' }, { code: 'NG', name: 'Nigeria', tax: '7.5% VAT' }, { code: 'GH', name: 'Ghana', tax: '12.5% VAT' }, { code: 'ZA', name: 'South Africa', tax: '15% VAT' }, { code: 'CI', name: 'Côte d\'Ivoire', tax: '18% TVA' }];
    const selectedCountry = countries.find(c => c.code === formData.country);

    return (
        <div className="checkout-form-container">
            <div className="checkout-form-left">
                <form onSubmit={handleSubmit} className="checkout-form">
                    <h3>Billing Information</h3>
                    <div className="form-row"><div className="form-group"><label>Full Name <span className="required">*</span></label><div className="input-with-icon"><FiUser /><input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="John Doe" className={formErrors.fullName ? 'error' : ''} /></div>{formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}</div><div className="form-group"><label>Email Address <span className="required">*</span></label><div className="input-with-icon"><FiMail /><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@company.com" className={formErrors.email ? 'error' : ''} /></div>{formErrors.email && <span className="error-message">{formErrors.email}</span>}</div></div>
                    <div className="form-row"><div className="form-group"><label>Phone Number</label><div className="input-with-icon"><FiPhone /><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+254 712 345 678" /></div></div><div className="form-group"><label>Company Name <span className="required">*</span></label><div className="input-with-icon"><FiBuilding /><input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="Acme Inc." className={formErrors.companyName ? 'error' : ''} /></div>{formErrors.companyName && <span className="error-message">{formErrors.companyName}</span>}</div></div>
                    <div className="form-row"><div className="form-group"><label>Address</label><div className="input-with-icon"><FiMapPin /><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" /></div></div><div className="form-group"><label>City</label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" /></div></div>
                    <div className="form-row"><div className="form-group"><label>Country</label><select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}>{countries.map(c => (<option key={c.code} value={c.code}>{c.name}</option>))}</select></div><div className="form-group"><label>Tax ID (Optional)</label><input type="text" value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} placeholder="KRA PIN / VAT ID" /></div></div>
                    {selectedCountry && <div className="tax-note">Tax ({selectedCountry.tax}) will be applied where applicable. Tax-exempt customers can enter their Tax ID.</div>}
                    <button type="submit" className="checkout-submit-btn" disabled={processing || loading}><FiLock /> {processing || loading ? 'Processing...' : `Pay ${CurrencyFormatter({ amount: displayPrice, currency: plan.currency, showSymbol: true })}`}</button>
                    {error && <div className="checkout-error-message"><FiAlertCircle /> {error}</div>}
                </form>
            </div>

            <div className="checkout-form-right">
                <div className="order-summary-card">
                    <h3>Order Summary</h3>
                    <div className="plan-badge">{plan.name} Plan</div>
                    <div className="billing-toggle"><button className={`toggle-btn ${billingInterval === 'monthly' ? 'active' : ''}`} onClick={() => setBillingInterval('monthly')}>Monthly</button><button className={`toggle-btn ${billingInterval === 'yearly' ? 'active' : ''}`} onClick={() => setBillingInterval('yearly')}>Yearly {savings > 0 && <span className="savings-badge">Save {savings}%</span>}</button></div>
                    <PriceDisplay price={displayPrice} yearlyPrice={billingInterval === 'yearly' ? displayPrice : null} currency={plan.currency} showYearly={billingInterval === 'yearly'} />
                    <div className="plan-features-preview"><strong>What's included:</strong><ul>{plan.features_list_display?.slice(0, 5).map((feature, i) => (<li key={i}>{feature}</li>))}{plan.features_list_display?.length > 5 && <li>+{plan.features_list_display.length - 5} more features</li>}</ul></div>
                    <div className="secure-checkout"><FiLock /> Secure checkout powered by PayStack</div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutForm;