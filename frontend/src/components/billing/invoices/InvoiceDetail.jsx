import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiMail, FiPrinter, FiCalendar, FiDollarSign, FiTag, FiUser, FiBuilding, FiAlertCircle } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useInvoice } from '../../../hooks/billing/useInvoice';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { InvoiceDownloadButton } from './InvoiceDownloadButton';
import { InvoicePaymentButton } from './InvoicePaymentButton';
import './invoices.css';

export const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { permissions } = useBillingPermissions();
    const { invoice, loading, error, fetchById, clear, sendEmail } = useInvoice(id, { autoFetch: true });
    const [sending, setSending] = useState(false);

    useEffect(() => { if (id) fetchById(id); return () => clear(); }, [id, fetchById, clear]);

    const handleSendEmail = async () => {
        setSending(true);
        await sendEmail(id);
        setSending(false);
    };

    const handlePrint = () => { window.print(); };

    if (loading) return <LoadingSkeleton type="invoice" count={1} />;
    if (error || !invoice) return <EmptyState type="default" title="Invoice Not Found" message="The invoice you're looking for doesn't exist or you don't have permission to view it." />;

    const isOverdue = invoice.status === 'overdue' || (invoice.status === 'pending' && new Date(invoice.due_date) < new Date());
    const displayStatus = isOverdue ? 'overdue' : invoice.status;

    return (
        <BillingShell title={`Invoice ${invoice.invoice_number}`} subtitle={`Generated on ${new Date(invoice.invoice_date).toLocaleDateString()}`} breadcrumb={true}>
            <div className="invoice-detail-container">
                <div className="invoice-detail-actions">
                    <button className="invoice-back-btn" onClick={() => navigate('/billing/invoices')}><FiArrowLeft /> Back to Invoices</button>
                    <div className="invoice-action-group">
                        <InvoiceDownloadButton invoiceId={invoice.id} variant="outline" />
                        <button className="invoice-action-btn outline" onClick={handlePrint}><FiPrinter /> Print</button>
                        <button className="invoice-action-btn outline" onClick={handleSendEmail} disabled={sending}><FiMail /> {sending ? 'Sending...' : 'Email'}</button>
                        {(invoice.status === 'pending' || isOverdue) && <InvoicePaymentButton invoiceId={invoice.id} amount={invoice.total_amount} currency={invoice.currency} variant="primary" onSuccess={() => fetchById(id)} />}
                    </div>
                </div>

                <div className="invoice-card">
                    <div className="invoice-header">
                        <div className="invoice-logo"><h2>FALCON PMS</h2><p>Enterprise Performance Management</p></div>
                        <div className="invoice-title"><h1>INVOICE</h1><StatusBadge type="invoice" status={displayStatus} size="lg" /></div>
                    </div>

                    <div className="invoice-info">
                        <div className="invoice-number-section"><span className="label">Invoice Number</span><span className="value">{invoice.invoice_number}</span></div>
                        <div className="invoice-date-section"><span className="label">Invoice Date</span><span className="value">{new Date(invoice.invoice_date).toLocaleDateString()}</span></div>
                        <div className="invoice-due-section"><span className="label">Due Date</span><span className={`value ${isOverdue ? 'overdue' : ''}`}>{new Date(invoice.due_date).toLocaleDateString()}</span></div>
                    </div>

                    <div className="invoice-parties">
                        <div className="invoice-from"><h3>From</h3><div className="party-details"><strong>Falcon PMS Ltd</strong><p>P.O. Box 12345<br />Nairobi, Kenya<br />Email: billing@falconpms.com<br />Phone: +254 700 123 456</p></div></div>
                        <div className="invoice-to"><h3>Bill To</h3><div className="party-details"><strong>Tenant ID: {invoice.tenant_id}</strong><p>{invoice.metadata?.company_name || 'N/A'}<br />{invoice.metadata?.email || 'N/A'}</p></div></div>
                    </div>

                    <div className="invoice-items">
                        <table className="invoice-items-table">
                            <thead><tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
                            <tbody>
                                {invoice.line_items?.map((item, index) => (
                                    <tr key={index} className={item.is_tax ? 'tax-row' : ''}>
                                        <td>{item.description}</td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-right"><CurrencyFormatter amount={item.unit_price} currency={invoice.currency} /></td>
                                        <td className="text-right"><CurrencyFormatter amount={item.total} currency={invoice.currency} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="invoice-summary">
                        <div className="summary-row"><span>Subtotal:</span><span><CurrencyFormatter amount={invoice.subtotal} currency={invoice.currency} /></span></div>
                        <div className="summary-row"><span>Tax ({Math.round(invoice.tax_rate * 100)}% VAT):</span><span><CurrencyFormatter amount={invoice.tax_amount} currency={invoice.currency} /></span></div>
                        <div className="summary-row total"><span>Total:</span><span><CurrencyFormatter amount={invoice.total_amount} currency={invoice.currency} /></span></div>
                    </div>

                    {invoice.notes && <div className="invoice-notes"><h4>Notes</h4><p>{invoice.notes}</p></div>}
                    {invoice.status === 'paid' && invoice.paid_at && <div className="invoice-paid-info"><FiCheckCircle /> Paid on {new Date(invoice.paid_at).toLocaleString()}</div>}
                    {(invoice.status === 'pending' || isOverdue) && <div className="invoice-payment-reminder"><FiAlertCircle /> Please pay before the due date to avoid service interruption.</div>}
                </div>
            </div>
        </BillingShell>
    );
};

export default InvoiceDetail;