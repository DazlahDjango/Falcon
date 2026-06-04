import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiEye, FiEdit2, FiMoreVertical, FiChevronLeft, FiChevronRight, FiUsers, FiCreditCard, FiFileText } from 'react-icons/fi';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useAdminBilling } from '../../../hooks/billing/useAdminBilling';
import { TenantSubscriptionManager } from './TenantSubscriptionManager';
import './admin.css';

export const TenantsList = () => {
    const { getTenantSubscriptions, getTenantInvoices, getTenantTransactions, loading } = useAdminBilling();
    const [tenants, setTenants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [showManager, setShowManager] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

    const fetchTenants = useCallback(async () => {
        try {
            const response = await fetch('/api/v1/admin/tenants?page=' + pagination.page + '&page_size=' + pagination.pageSize);
            const data = await response.json();
            if (data?.data) {
                setTenants(data.data);
                setPagination(prev => ({ ...prev, total: data.count || 0 }));
            }
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        }
    }, [pagination.page, pagination.pageSize]);

    useEffect(() => { fetchTenants(); }, [fetchTenants]);

    const handleViewTenant = async (tenant) => {
        setSelectedTenant(tenant);
        await Promise.all([
            getTenantSubscriptions(tenant.id),
            getTenantInvoices(tenant.id),
            getTenantTransactions(tenant.id)
        ]);
        setShowManager(true);
    };

    const filteredTenants = tenants.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && tenants.length === 0) return <LoadingSkeleton type="table" count={1} />;

    return (
        <>
            <BillingCard title="Tenants" icon={<FiUsers />} className="tenants-list-card">
                <div className="tenants-search">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Search tenants by name, email, or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="tenants-search-input" />
                </div>
                <div className="tenants-table-container">
                    <table className="tenants-table">
                        <thead>
                            <tr><th>Tenant</th><th>Plan</th><th>Status</th><th>Monthly Spend</th><th>Joined</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filteredTenants.length === 0 ? (
                                <tr><td colSpan="6"><EmptyState type="default" title="No tenants found" /></td></tr>
                            ) : (
                                filteredTenants.map(tenant => (
                                    <tr key={tenant.id}>
                                        <td className="tenant-cell">
                                            <div className="tenant-info"><span className="tenant-name">{tenant.name}</span><span className="tenant-email">{tenant.email}</span></div>
                                        </td>
                                        <td>{tenant.plan_name || 'No Plan'}</td>
                                        <td><StatusBadge type="subscription" status={tenant.subscription_status || 'inactive'} size="sm" /></td>
                                        <td><CurrencyFormatter amount={tenant.monthly_spend || 0} /></td>
                                        <td>{new Date(tenant.created_at).toLocaleDateString()}</td>
                                        <td className="tenant-actions">
                                            <button className="tenant-action-btn" onClick={() => handleViewTenant(tenant)} title="View Details"><FiEye /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {pagination.total > pagination.pageSize && (
                    <div className="tenants-pagination">
                        <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}><FiChevronLeft /></button>
                        <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}</span>
                        <button disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}><FiChevronRight /></button>
                    </div>
                )}
            </BillingCard>
            {showManager && selectedTenant && <TenantSubscriptionManager tenant={selectedTenant} onClose={() => setShowManager(false)} />}
        </>
    );
};

export default TenantsList;