import React from 'react';
import { FiDownload, FiMail, FiEye, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { InvoiceDownloadButton } from '../invoices/InvoiceDownloadButton';
import { InvoicePaymentButton } from '../invoices/InvoicePaymentButton';
import './billing-portal.css';

export const PortalInvoices = ({ invoices, loading }) => {
    if (loading) return <LoadingSkeleton type="table" count={1} />;
    if (!invoices?.length) return <EmptyState type="invoices" />;

    const pendingInvoices = invoices.filter(i => i.status === 'pending');
    const totalOutstanding = pendingInvoices.reduce((sum, i) => sum + i.total_amount, 0);

    return (
        <div className="portal-invoices">
            <div className="invoice-summary-banner">
                <div className="summary-item"><span>Total Invoices</span><strong>{invoices.length}</strong></div>
                <div className="summary-item"><span>Paid</span><strong>{invoices.filter(i => i.status === 'paid').length}</strong></div>
                <div className="summary-item"><span>Pending</span><strong className="warning">{pendingInvoices.length}</strong></div>
                <div className="summary-item"><span>Outstanding</span><strong><CurrencyFormatter amount={totalOutstanding} showCents={false} /></strong></div>
            </div>

            <BillingCard title="Invoice History" icon={<FiCalendar />}>
                <div className="invoices-table-container">
                    <table className="portal-invoices-table">
                        <thead>
                            <tr><th>Invoice #</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => {
                                const isOverdue = inv.status === 'overdue' || (inv.status === 'pending' && new Date(inv.due_date) < new Date());
                                return (<tr key={inv.id} className={isOverdue ? 'overdue-row' : ''}>
                                    <td className="invoice-number">{inv.invoice_number}</td>
                                    <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                                    <td className={isOverdue ? 'overdue-date' : ''}>{new Date(inv.due_date).toLocaleDateString()}</td>
                                    <td><CurrencyFormatter amount={inv.total_amount} currency={inv.currency} /></td>
                                    <td><StatusBadge type="invoice" status={isOverdue ? 'overdue' : inv.status} size="sm" /></td>
                                    <td className="invoice-actions">
                                        <InvoiceDownloadButton invoiceId={inv.id} />
                                        <button className="portal-icon-btn" onClick={() => window.open(`/billing/invoices/${inv.id}`, '_blank')}><FiEye /></button>
                                        <button className="portal-icon-btn" onClick={() => { }}><FiMail /></button>
                                        {(inv.status === 'pending' || isOverdue) && <InvoicePaymentButton invoiceId={inv.id} amount={inv.total_amount} currency={inv.currency} variant="text" />}
                                    </td>
                                </tr>);
                            })}
                        </tbody>
                    </table>
                </div>
            </BillingCard>
        </div>
    );
};

export default PortalInvoices;