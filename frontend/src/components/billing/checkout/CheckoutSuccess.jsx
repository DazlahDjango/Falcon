import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiDownload, FiMail, FiHome, FiCreditCard, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { useCheckout } from '../../../hooks/billing/useCheckout';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import './checkout.css';

export const CheckoutSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyCheckout } = useCheckout();
    const { fetchCurrent, subscription } = useSubscription({ autoFetch: false });
    const [verifying, setVerifying] = useState(true);
    const [transaction, setTransaction] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const reference = new URLSearchParams(location.search).get('reference') || new URLSearchParams(location.search).get('trxref');
        if (reference) { verifyTransaction(reference); }
        else { setVerifying(false); setError('No transaction reference found'); }
    }, []);

    const verifyTransaction = async (reference) => {
        try {
            const result = await verifyCheckout(reference);
            if (result?.verified) { setTransaction(result); await fetchCurrent(); }
            else { setError(result?.message || 'Payment verification failed'); }
        } catch (err) { setError(err.message || 'Failed to verify payment'); }
        finally { setVerifying(false); }
    };

    const handleDownloadInvoice = () => { if (transaction?.invoice_id) window.open(`/api/v1/billing/invoices/${transaction.invoice_id}/download/`, '_blank'); };
    const handleViewSubscription = () => navigate('/billing/subscriptions');
    const handleReturnHome = () => navigate('/dashboard');

    if (verifying) return <div className="checkout-success-container"><LoadingSkeleton type="card" count={1} /><p className="verifying-text">Verifying your payment...</p></div>;
    if (error) return (<div className="checkout-success-container error"><div className="success-card"><div className="success-icon error"><FiXCircle /></div><h2>Payment Verification Failed</h2><p>{error}</p><button className="return-btn" onClick={handleReturnHome}>Return to Dashboard</button></div></div>);

    return (
        <div className="checkout-success-container">
            <div className="success-card">
                <div className="success-icon"><FiCheckCircle /></div>
                <h1>Payment Successful!</h1>
                <p>Thank you for your purchase. Your transaction has been completed successfully.</p>

                <div className="transaction-details">
                    <div className="detail-row"><FiCreditCard /><span>Transaction Reference:</span><strong>{transaction?.reference}</strong></div>
                    <div className="detail-row"><FiDollarSign /><span>Amount Paid:</span><strong><CurrencyFormatter amount={transaction?.amount || transaction?.total_amount} /></strong></div>
                    <div className="detail-row"><FiCalendar /><span>Date:</span><strong>{new Date().toLocaleString()}</strong></div>
                    {subscription && (<div className="detail-row highlight"><FiCheckCircle /><span>Subscription Status:</span><strong className="active">{subscription.status}</strong></div>)}
                </div>

                {subscription && subscription.is_on_trial && (<div className="trial-notice"><FiCalendar /> Your {subscription.trial_days_remaining}-day trial period has started. You will be billed after the trial ends.</div>)}

                <div className="action-buttons">
                    <button className="action-btn primary" onClick={handleViewSubscription}><FiCreditCard /> View Subscription</button>
                    <button className="action-btn secondary" onClick={handleDownloadInvoice}><FiDownload /> Download Invoice</button>
                    <button className="action-btn outline" onClick={handleReturnHome}><FiHome /> Return to Dashboard</button>
                </div>

                <div className="email-notice"><FiMail /> A confirmation email has been sent to your registered email address.</div>
            </div>
        </div>
    );
};

export default CheckoutSuccess;