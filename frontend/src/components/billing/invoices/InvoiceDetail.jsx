import React from 'react';
import PropTypes from 'prop-types';
import { StatusBadge } from '../shared/StatusBadge';
import { InvoiceDownloadButton } from './InvoiceDownloadButton';
import { InvoicePaymentButton } from './InvoicePaymentButton';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { renderBillingIcon } from '../shared/BillingIcons';

export const InvoiceDetail = ({ invoice, loading, error, onDownload, onPay, downloading, paying }) => {
    if (loading) {
        return <LoadingSkeleton type="card" />;
    }

    if (error || !invoice) {
        return (
            <EmptyState 
                title="Invoice not found"
                message="The invoice you're looking for doesn't exist"
                icon={renderBillingIcon('invoiceSearch', { size: 40 })}
            />
        );
    }

    const isPending = invoice.status === 'pending';
    const isOverdue = invoice.status === 'overdue';
    const isPaid = invoice.status === 'paid';
    const canPay = isPending || isOverdue;

    const formatLineItems = () => {
        if (!invoice.line_items || invoice.line_items.length === 0) return [];
        
        return invoice.line_items.map((item, index) => ({
            ...item,
            id: index,
            unit_price_display: `${invoice.currency} ${(item.unit_price / 100).toLocaleString()}`,
            total_display: `${invoice.currency} ${(item.total / 100).toLocaleString()}`,
        }));
    };

    const lineItems = formatLineItems();

    return (
        <div className="invoice-detail">
            <div className="invoice-detail-header">
                <div className="invoice-detail-title-section">
                    <h2 className="invoice-detail-title">Invoice {invoice.invoice_number}</h2>
                    <StatusBadge status={invoice.status} size="large" />
                </div>
                <div className="invoice-detail-actions">
                    {canPay && (
                        <InvoicePaymentButton 
                            invoice={invoice}
                            onPay={onPay}
                            paying={paying}
                            variant="primary"
                        />
                    )}
                    <InvoiceDownloadButton 
                        invoice={invoice}
                        onDownload={onDownload}
                        downloading={downloading}
                        variant="outline"
                    />
                </div>
            </div>

            <div className="invoice-detail-company">
                <div className="invoice-detail-company-info">
                    <h3>Falcon PMS</h3>
                    <p>123 Business Avenue<br />Nairobi, Kenya</p>
                    <p>Email: billing@falconpms.com</p>
                </div>
                <div className="invoice-detail-bill-to">
                    <h4>Bill To:</h4>
                    <p>Tenant ID: {invoice.tenant_id}</p>
                </div>
            </div>

            <div className="invoice-detail-dates">
                <div className="invoice-detail-date">
                    <span>Invoice Date:</span>
                    <strong>{new Date(invoice.invoice_date).toLocaleDateString()}</strong>
                </div>
                <div className="invoice-detail-date">
                    <span>Due Date:</span>
                    <strong className={isOverdue ? 'text-error' : ''}>
                        {new Date(invoice.due_date).toLocaleDateString()}
                    </strong>
                </div>
                {isPaid && invoice.paid_at && (
                    <div className="invoice-detail-date">
                        <span>Paid Date:</span>
                        <strong>{new Date(invoice.paid_at).toLocaleDateString()}</strong>
                    </div>
                )}
            </div>

            <div className="invoice-detail-table-container">
                <table className="invoice-detail-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.filter(item => !item.is_tax).map((item) => (
                            <tr key={item.id}>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{item.unit_price_display}</td>
                                <td>{item.total_display}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="invoice-detail-subtotal">
                            <td colSpan="3">Subtotal</td>
                            <td>{invoice.currency} {(invoice.subtotal / 100).toLocaleString()}</td>
                        </tr>
                        {lineItems.filter(item => item.is_tax).map((item) => (
                            <tr key={item.id}>
                                <td colSpan="3">{item.description}</td>
                                <td>{item.total_display}</td>
                            </tr>
                        ))}
                        <tr className="invoice-detail-total">
                            <td colSpan="3">Total</td>
                            <td className="invoice-detail-total-amount">
                                {invoice.currency} {(invoice.total_amount / 100).toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {invoice.notes && (
                <div className="invoice-detail-notes">
                    <h4>Notes</h4>
                    <p>{invoice.notes}</p>
                </div>
            )}

            <div className="invoice-detail-footer">
                <p>Thank you for your business!</p>
                <p className="invoice-detail-terms">
                    Payment terms: Due within 30 days. Late payments may incur additional fees.
                </p>
            </div>
        </div>
    );
};

InvoiceDetail.propTypes = {
    invoice: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.string,
    onDownload: PropTypes.func,
    onPay: PropTypes.func,
    downloading: PropTypes.bool,
    paying: PropTypes.bool,
};

export default InvoiceDetail;