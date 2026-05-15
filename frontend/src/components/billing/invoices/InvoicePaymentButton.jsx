import React from 'react';
import PropTypes from 'prop-types';
import { useCheckout } from '../../../hooks/billing';

export const InvoicePaymentButton = ({ 
    invoice, 
    onPay, 
    paying = false,
    variant = 'primary',
    size = 'medium',
    children 
}) => {
    const { initOneTimeCheckout, redirectToPayment } = useCheckout();

    const handlePay = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (onPay) {
            onPay(invoice.id);
        } else {
            // Default payment flow
            try {
                const result = await initOneTimeCheckout({
                    amount: invoice.total_amount,
                    description: `Payment for invoice ${invoice.invoice_number}`,
                    metadata: {
                        invoice_id: invoice.id,
                        invoice_number: invoice.invoice_number,
                    },
                });
                
                if (result?.authorization_url) {
                    redirectToPayment(result.authorization_url);
                }
            } catch (error) {
                console.error('[InvoicePaymentButton] Error:', error);
                alert('Failed to initialize payment. Please try again.');
            }
        }
    };

    const variants = {
        primary: 'invoice-pay-btn-primary',
        secondary: 'invoice-pay-btn-secondary',
        outline: 'invoice-pay-btn-outline',
    };

    const sizes = {
        small: 'invoice-pay-btn-small',
        medium: 'invoice-pay-btn-medium',
        large: 'invoice-pay-btn-large',
    };

    return (
        <button
            className={`invoice-pay-btn ${variants[variant]} ${sizes[size]} ${paying ? 'invoice-pay-btn-loading' : ''}`}
            onClick={handlePay}
            disabled={paying}
        >
            {paying ? (
                <span className="invoice-pay-spinner"></span>
            ) : (
                children || (
                    <>
                        <span className="invoice-pay-icon">💰</span>
                        <span>Pay Now</span>
                    </>
                )
            )}
        </button>
    );
};

InvoicePaymentButton.propTypes = {
    invoice: PropTypes.object.isRequired,
    onPay: PropTypes.func,
    paying: PropTypes.bool,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    children: PropTypes.node,
};

export default InvoicePaymentButton;