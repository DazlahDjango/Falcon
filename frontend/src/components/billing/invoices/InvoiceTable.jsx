import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiDownload, FiMail } from 'react-icons/fi';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { InvoiceDownloadButton } from './InvoiceDownloadButton';
import { InvoicePaymentButton } from './InvoicePaymentButton';
import './invoices.css';

export const InvoiceTable = ({ invoices, onRefresh, loading }) => {
    const navigate = useNavigate();

    if (loading) return <div className="invoice-table-loading"><div className="skeleton skeleton-line"></div><div className="skeleton skeleton-line"></div><div className="skeleton skeleton-line"></div></div>;
    if (!invoices?.length) return <div className="invoice-table-empty">No invoices found</div>;

    return (
        <div className="invoice-table-container">
            <table className="invoice-table">
                <thead>
                    <tr><th>Invoice #</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {invoices.map(invoice => {
                        const isOverdue = invoice.status === 'overdue' || (invoice.status === 'pending' && new Date(invoice.due_date) < new Date());
                        return (
                            <tr key={invoice.id} className={isOverdue ? 'overdue-row' : ''}>
                                <td className="invoice-number-cell">{invoice.invoice_number}</td>
                                <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                                <td className={isOverdue ? 'overdue-date' : ''}>{new Date(invoice.due_date).toLocaleDateString()}</td>
                                <td><CurrencyFormatter amount={invoice.total_amount} currency={invoice.currency} /></td>
                                <td><StatusBadge type="invoice" status={isOverdue ? 'overdue' : invoice.status} size="sm" /></td>
                                <td className="invoice-actions-cell">
                                    <button className="invoice-action-icon" onClick={() => navigate(`/billing/invoices/${invoice.id}`)}><FiEye /></button>
                                    <InvoiceDownloadButton invoiceId={invoice.id} />
                                    <button className="invoice-action-icon" onClick={() => { }}><FiMail /></button>
                                    {(invoice.status === 'pending' || isOverdue) && <InvoicePaymentButton invoiceId={invoice.id} amount={invoice.total_amount} currency={invoice.currency} onSuccess={onRefresh} />}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceTable;