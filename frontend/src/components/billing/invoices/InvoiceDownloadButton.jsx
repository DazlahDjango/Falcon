import React from 'react';
import PropTypes from 'prop-types';
import { renderBillingIcon } from '../shared/BillingIcons';

export const InvoiceDownloadButton = ({ 
    invoice, 
    onDownload, 
    downloading = false,
    variant = 'outline',
    size = 'medium',
    children 
}) => {
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDownload?.(invoice.id);
    };

    const variants = {
        primary: 'invoice-download-btn-primary',
        secondary: 'invoice-download-btn-secondary',
        outline: 'invoice-download-btn-outline',
    };

    const sizes = {
        small: 'invoice-download-btn-small',
        medium: 'invoice-download-btn-medium',
        large: 'invoice-download-btn-large',
    };

    return (
        <button
            className={`invoice-download-btn ${variants[variant]} ${sizes[size]} ${downloading ? 'invoice-download-btn-loading' : ''}`}
            onClick={handleClick}
            disabled={downloading}
        >
            {downloading ? (
                <span className="invoice-download-spinner"></span>
            ) : (
                children || (
                    <>
                        <span className="invoice-download-icon">{renderBillingIcon('invoiceDownload', { size: 18 })}</span>
                        <span>Download PDF</span>
                    </>
                )
            )}
        </button>
    );
};

InvoiceDownloadButton.propTypes = {
    invoice: PropTypes.object.isRequired,
    onDownload: PropTypes.func,
    downloading: PropTypes.bool,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    children: PropTypes.node,
};

export default InvoiceDownloadButton;