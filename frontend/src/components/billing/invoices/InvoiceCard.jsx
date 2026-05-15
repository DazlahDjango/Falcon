import React from 'react';
import PropTypes from 'prop-types';
import { StatusBadge } from '../shared/StatusBadge';
import { InvoiceDownloadButton } from './InvoiceDownloadButton';
import { InvoicePaymentButton } from './InvoicePaymentButton';

export const InvoiceCard = ({ 
    invoice, 
    onClick, 
    onDownload, 
    onPay,
    downloading = false,
    paying = false 
}) => {
    const isOverdue = invoice.status === 'overdue';
    const isPending = invoice.status === 'pending';
    const isPaid = invoice.status === 'paid';

    const getDueStatus = () => {
        if (isOverdue) {
            return <span className="invoice-card-status-overdue">Overdue</span>;
        }
        if (isPending && new Date(invoice.due_date) < new Date()) {
            return <span className="invoice-card-status-overdue">Past Due</span>;
        }
        return null;
    };

    return (
        <div className={`invoice-card ${isOverdue ? 'invoice-card-overdue' : ''}`} onClick={onClick}>
            <div className="invoice-card-header">
                <div className="invoice-card-info">
                    <span className="invoice-card-number">{invoice.invoice_number}</span>
                    <StatusBadge status={invoice.status} size="small" />
                    {getDueStatus()}
                </div>
                <div className="invoice-card-amount">
                    <span className="invoice-card-amount-value">
                        KES {((invoice.total_amount || 0) / 100).toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="invoice-card-body">
                <div className="invoice-card-dates">
                    <div className="invoice-card-date">
                        <span>Issued:</span>
                        <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                    </div>
                    <div className="invoice-card-date">
                        <span>Due:</span>
                        <span className={isOverdue || (isPending && new Date(invoice.due_date) < new Date()) ? 'text-error' : ''}>
                            {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                {isPaid && invoice.paid_at && (
                    <div className="invoice-card-paid">
                        Paid on {new Date(invoice.paid_at).toLocaleDateString()}
                    </div>
                )}
            </div>

            <div className="invoice-card-actions" onClick={(e) => e.stopPropagation()}>
                {(isPending || isOverdue) && (
                    <InvoicePaymentButton 
                        invoice={invoice}
                        onPay={onPay}
                        paying={paying}
                        variant="primary"
                        size="small"
                    />
                )}
                <InvoiceDownloadButton 
                    invoice={invoice}
                    onDownload={onDownload}
                    downloading={downloading}
                    size="small"
                />
            </div>
        </div>
    );
};

InvoiceCard.propTypes = {
    invoice: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    onDownload: PropTypes.func,
    onPay: PropTypes.func,
    downloading: PropTypes.bool,
    paying: PropTypes.bool,
};

export default InvoiceCard;