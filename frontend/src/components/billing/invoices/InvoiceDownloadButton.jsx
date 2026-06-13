import React, { useState } from 'react';
import { FiDownload, FiLoader } from 'react-icons/fi';
import { useInvoice } from '../../../hooks/billing/useInvoice';
import './invoices.css';

export const InvoiceDownloadButton = ({ invoiceId, variant = 'icon', onSuccess }) => {
    const { download, downloading } = useInvoice();
    const [loading, setLoading] = useState(false);

    const handleDownload = async (format = 'pdf') => {
        setLoading(true);
        try {
            const result = await download(invoiceId, format);
            if (result?.data) {
                const blob = new Blob([result.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice_${invoiceId}.${format}`;
                a.click();
                URL.revokeObjectURL(url);
                if (onSuccess) onSuccess();
            }
        } catch (error) { console.error('Download failed:', error); }
        finally { setLoading(false); }
    };

    if (variant === 'text') {
        return (
            <button className="invoice-download-text" onClick={() => handleDownload('pdf')} disabled={loading}>
                {loading ? <FiLoader className="spin" /> : <FiDownload />} Download PDF
            </button>
        );
    }

    return (
        <button className="invoice-action-btn" onClick={() => handleDownload('pdf')} title="Download PDF" disabled={loading}>
            {loading ? <FiLoader className="spin" /> : <FiDownload />}
        </button>
    );
};

export default InvoiceDownloadButton;