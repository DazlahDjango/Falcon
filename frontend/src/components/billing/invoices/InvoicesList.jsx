import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiDownload, FiMail, FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiCalendar, FiDollarSign, FiFileText, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useInvoices } from '../../../hooks/billing/useInvoices';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { InvoiceFilter } from './InvoiceFilter';
import { InvoiceDownloadButton } from './InvoiceDownloadButton';
import { InvoicePaymentButton } from './InvoicePaymentButton';
import './invoices.css';

export const InvoicesList = () => {
    const navigate = useNavigate();
    const { permissions } = useBillingPermissions();
    const { invoices, pagination, summary, loading, fetchAll, setPage, setPageSize, applyFilters, filters } = useInvoices({ autoFetch: false });
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => { fetchAll({ page: pagination.page, pageSize: pagination.pageSize, filters }); }, [pagination.page, pagination.pageSize, filters, fetchAll]);

    const handleFilterApply = () => { applyFilters(localFilters); setShowFilters(false); };
    const handleFilterClear = () => { setLocalFilters({ status: null, unpaidOnly: false, startDate: null, endDate: null }); applyFilters({ status: null, unpaidOnly: false, startDate: null, endDate: null }); };

    const handleViewInvoice = (id) => { navigate(`/billing/invoices/${id}`); };
    const handleSendEmail = async (id) => { await sendInvoiceEmail(id); };

    const stats = [
        { label: 'Total Invoices', value: pagination.total, icon: FiFileText, color: '#3b82f6' },
        { label: 'Paid', value: summary?.total_paid_count || 0, icon: FiCheckCircle, color: '#22c55e' },
        { label: 'Pending', value: summary?.total_pending_count || 0, icon: FiClock, color: '#f59e0b' },
        { label: 'Overdue', value: summary?.total_overdue_count || 0, icon: FiAlertCircle, color: '#dc2626' },
        { label: 'Total Outstanding', value: summary?.total_outstanding || 0, icon: FiDollarSign, color: '#8b5cf6', isCurrency: true }
    ];

    if (loading && invoices.length === 0) return <LoadingSkeleton type="table" count={1} />;

    return (
        <BillingShell title="Invoices" subtitle="View and manage your billing invoices">
            <div className="invoices-container">
                <div className="invoices-stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="invoice-stat-card" style={{ borderTopColor: stat.color }}>
                            <div className="invoice-stat-header"><span className="invoice-stat-label">{stat.label}</span><stat.icon className="invoice-stat-icon" style={{ color: stat.color }} /></div>
                            <div className="invoice-stat-value">{stat.isCurrency ? <CurrencyFormatter amount={stat.value} showCents={false} /> : stat.value}</div>
                        </div>
                    ))}
                </div>

                <BillingCard title="All Invoices" icon={<FiFileText />} headerAction={
                    <div className="invoices-header-actions">
                        <button className="invoices-filter-btn" onClick={() => setShowFilters(!showFilters)}><FiFilter /> Filter</button>
                        <button className="invoices-refresh-btn" onClick={() => fetchAll({ page: pagination.page, pageSize: pagination.pageSize, filters })}><FiSearch /> Refresh</button>
                    </div>
                }>
                    <InvoiceFilter filters={localFilters} onChange={setLocalFilters} onApply={handleFilterApply} onClear={handleFilterClear} show={showFilters} />

                    {invoices.length === 0 ? <EmptyState type="invoices" actionText="No invoices found" /> : (
                        <div className="invoices-table-container">
                            <table className="invoices-table">
                                <thead>
                                    <tr><th>Invoice #</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {invoices.map(invoice => {
                                        const isOverdue = invoice.status === 'overdue' || (invoice.status === 'pending' && new Date(invoice.due_date) < new Date());
                                        const isPaid = invoice.status === 'paid';
                                        return (
                                            <tr key={invoice.id} className={isOverdue ? 'row-overdue' : isPaid ? 'row-paid' : ''}>
                                                <td className="invoice-number-cell"><span className="invoice-number">{invoice.invoice_number}</span></td>
                                                <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                                                <td className={isOverdue ? 'overdue-date' : ''}>{new Date(invoice.due_date).toLocaleDateString()}</td>
                                                <td className="invoice-amount"><CurrencyFormatter amount={invoice.total_amount} currency={invoice.currency} /></td>
                                                <td><StatusBadge type="invoice" status={isOverdue ? 'overdue' : invoice.status} size="sm" /></td>
                                                <td className="invoice-actions">
                                                    <button className="invoice-action-btn" onClick={() => handleViewInvoice(invoice.id)} title="View Details"><FiEye /></button>
                                                    <InvoiceDownloadButton invoiceId={invoice.id} />
                                                    <button className="invoice-action-btn" onClick={() => handleSendEmail(invoice.id)} title="Send Email"><FiMail /></button>
                                                    {(invoice.status === 'pending' || isOverdue) && <InvoicePaymentButton invoiceId={invoice.id} amount={invoice.total_amount} currency={invoice.currency} onSuccess={() => fetchAll({ page: pagination.page, pageSize: pagination.pageSize, filters })} />}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {pagination.total > pagination.pageSize && (
                        <div className="invoices-pagination">
                            <button disabled={pagination.page === 1} onClick={() => setPage(pagination.page - 1)}><FiChevronLeft /></button>
                            <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)} ({pagination.total} invoices)</span>
                            <button disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)} onClick={() => setPage(pagination.page + 1)}><FiChevronRight /></button>
                        </div>
                    )}
                </BillingCard>
            </div>
        </BillingShell>
    );
};

export default InvoicesList;