import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiDownload, FiRefreshCw, FiDollarSign, FiActivity, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useTransactions } from '../../../hooks/billing/useTransactions';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { TransactionFilter } from './TransactionFilter';
import { TransactionRow } from './TransactionRow';
import './transactions.css';

export const TransactionsList = () => {
    const navigate = useNavigate();
    const { permissions } = useBillingPermissions();
    const { transactions, pagination, summary, loading, fetchAll, setPage, setPageSize, applyFilters, filters, exportTransactions } = useTransactions({ autoFetch: false });
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);
    const [exporting, setExporting] = useState(false);

    useEffect(() => { fetchAll({ page: pagination.page, pageSize: pagination.pageSize, filters }); }, [pagination.page, pagination.pageSize, filters, fetchAll]);

    const handleFilterApply = () => { applyFilters(localFilters); setShowFilters(false); };
    const handleFilterClear = () => { setLocalFilters({ status: null, type: null, startDate: null, endDate: null, reference: null }); applyFilters({ status: null, type: null, startDate: null, endDate: null, reference: null }); };
    const handleExport = async () => { setExporting(true); await exportTransactions(); setExporting(false); };
    const handleViewDetails = (id) => navigate(`/billing/transactions/${id}`);

    const stats = [
        { label: 'Total Transactions', value: pagination.total, icon: FiActivity, color: '#3b82f6' },
        { label: 'Successful', value: summary?.successful_transactions || 0, icon: FiCheckCircle, color: '#22c55e' },
        { label: 'Failed', value: summary?.failed_transactions || 0, icon: FiXCircle, color: '#dc2626' },
        { label: 'Total Volume', value: summary?.total_spent || 0, icon: FiDollarSign, color: '#8b5cf6', isCurrency: true }
    ];

    if (loading && transactions.length === 0) return <LoadingSkeleton type="table" count={1} />;

    return (
        <BillingShell title="Transactions" subtitle="View and manage all your payment transactions">
            <div className="transactions-container">
                <div className="transactions-stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="transaction-stat-card" style={{ borderTopColor: stat.color }}>
                            <div className="transaction-stat-header"><span className="transaction-stat-label">{stat.label}</span><stat.icon className="transaction-stat-icon" style={{ color: stat.color }} /></div>
                            <div className="transaction-stat-value">{stat.isCurrency ? <CurrencyFormatter amount={stat.value} showCents={false} /> : stat.value}</div>
                        </div>
                    ))}
                </div>

                <BillingCard title="Transaction History" icon={<FiActivity />} headerAction={
                    <div className="transactions-header-actions">
                        <button className="transactions-filter-btn" onClick={() => setShowFilters(!showFilters)}><FiFilter /> Filter</button>
                        <button className="transactions-export-btn" onClick={handleExport} disabled={exporting}><FiDownload /> {exporting ? 'Exporting...' : 'Export'}</button>
                        <button className="transactions-refresh-btn" onClick={() => fetchAll({ page: pagination.page, pageSize: pagination.pageSize, filters })}><FiRefreshCw /> Refresh</button>
                    </div>
                }>
                    <TransactionFilter filters={localFilters} onChange={setLocalFilters} onApply={handleFilterApply} onClear={handleFilterClear} show={showFilters} />

                    {transactions.length === 0 ? <EmptyState type="transactions" /> : (
                        <div className="transactions-table-container">
                            <table className="transactions-table">
                                <thead>
                                    <tr><th>Reference</th><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Payment Method</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {transactions.map(tx => (
                                        <TransactionRow key={tx.id} transaction={tx} onViewDetails={() => handleViewDetails(tx.id)} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {pagination.total > pagination.pageSize && (
                        <div className="transactions-pagination">
                            <button disabled={pagination.page === 1} onClick={() => setPage(pagination.page - 1)}><FiChevronLeft /></button>
                            <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)} ({pagination.total} transactions)</span>
                            <button disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)} onClick={() => setPage(pagination.page + 1)}><FiChevronRight /></button>
                        </div>
                    )}
                </BillingCard>
            </div>
        </BillingShell>
    );
};

export default TransactionsList;