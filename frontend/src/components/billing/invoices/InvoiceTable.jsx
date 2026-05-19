import React from 'react';
import PropTypes from 'prop-types';
import { StatusBadge } from '../shared/StatusBadge';
import { InvoiceDownloadButton } from './InvoiceDownloadButton';
import { InvoicePaymentButton } from './InvoicePaymentButton';

export const InvoiceTable = ({ 
    invoices, 
    onRowClick, 
    onDownload, 
    onPay,
    downloadingId,
    payingId 
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString();
    };

    const isOverdue = (invoice) => {
        return invoice.status === 'overdue' || 
               (invoice.status === 'pending' && new Date(invoice.due_date) < new Date());
    };

    return (
        <div className="invoice-table-container">
            <table className="invoice-table">
                <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice) => (
                        <tr 
                            key={invoice.id} 
                            className={`invoice-table-row ${isOverdue(invoice) ? 'invoice-table-row-overdue' : ''}`}
                            onClick={() => onRowClick?.(invoice.id)}
                        >
                            <td className="invoice-table-number">{invoice.invoice_number}</td>
                            <td>{formatDate(invoice.invoice_date)}</td>
                            <td className={isOverdue(invoice) ? 'text-error' : ''}>
                                {formatDate(invoice.due_date)}
                            </td>
                            <td className="invoice-table-amount">
                                KES {((invoice.total_amount || 0) / 100).toLocaleString()}
                            </td>
                            <td>
                                <StatusBadge status={invoice.status} size="small" />
                            </td>
                            <td className="invoice-table-actions" onClick={(e) => e.stopPropagation()}>
                                {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                                    <InvoicePaymentButton 
                                        invoice={invoice}
                                        onPay={onPay}
                                        paying={payingId === invoice.id}
                                        size="small"
                                        variant="primary"
                                    />
                                )}
                                <InvoiceDownloadButton 
                                    invoice={invoice}
                                    onDownload={onDownload}
                                    downloading={downloadingId === invoice.id}
                                    size="small"
                                    variant="outline"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

InvoiceTable.propTypes = {
    invoices: PropTypes.array.isRequired,
    onRowClick: PropTypes.func,
    onDownload: PropTypes.func,
    onPay: PropTypes.func,
    downloadingId: PropTypes.string,
    payingId: PropTypes.string,
};

export default InvoiceTable;