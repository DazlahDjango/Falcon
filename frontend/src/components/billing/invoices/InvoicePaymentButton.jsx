import React, { useState } from 'react';
import { FiCreditCard, FiLoader } from 'react-icons/fi';
import { useCheckout } from '../../../hooks/billing/useCheckout';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './invoices.css';

export const InvoicePaymentButton = ({ invoiceId, amount, currency = 'KES', variant = 'icon', onSuccess }) => {
    const { initOneTime, loading } = useCheckout();
    const [processing, setProcessing] = useState(false);

    const handlePay = async () => {
        setProcessing(true);
        try {
            const result = await initOneTime({ amount, description: `Invoice Payment ${invoiceId}`, successUrl: window.location.origin + `/billing/invoices/${invoiceId}`, cancelUrl: window.location.origin + `/billing/invoices/${invoiceId}`, metadata: { invoice_id: invoiceId, source: 'invoice_payment' } });
            if (result?.authorization_url) window.location.href = result.authorization_url;
            else if (onSuccess) onSuccess();
        } catch (error) { console.error('Payment failed:', error); }
        finally { setProcessing(false); }
    };

    if (variant === 'text') {
        return (
            <button className="invoice-pay-text" onClick={handlePay} disabled={processing}>
                {processing ? <FiLoader className="spin" /> : <FiCreditCard />} Pay <CurrencyFormatter amount={amount} currency={currency} showCents={false} />
            </button>
        );
    }

    return (
        <button className="invoice-pay-btn" onClick={handlePay} disabled={processing} title={`Pay ${CurrencyFormatter({ amount, currency, showSymbol: true })}`}>
            {processing ? <FiLoader className="spin" /> : <FiCreditCard />}
        </button>
    );
};

export default InvoicePaymentButton;