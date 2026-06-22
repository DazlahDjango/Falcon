import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiChevronLeft, FiChevronRight, FiDollarSign, FiPercent, FiUsers, FiDatabase, FiAward } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { useEnterprise } from '../../../hooks/billing/useEnterprise';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { EnterpriseOverrideModal } from './EnterpriseOverrideModal';
import './enterprise.css';

export const EnterpriseOverridesManager = () => {
    const { permissions } = useBillingPermissions();
    const { overrides, dynamicPlans, loading, fetchAllOverrides, fetchAllDynamicPlans, deleteOverride } = useEnterprise({ autoFetch: true });
    const [showModal, setShowModal] = useState(false);
    const [editingOverride, setEditingOverride] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => { setRefreshing(true); await Promise.all([fetchAllOverrides({}), fetchAllDynamicPlans()]); setRefreshing(false); };
    const handleDelete = async (id) => { if (window.confirm('Are you sure you want to delete this override?')) await deleteOverride(id); };

    if (!permissions.canManagePlans) return <EmptyState type="default" title="Access Denied" message="You don't have permission to manage enterprise overrides." />;
    if (loading && overrides.length === 0) return <LoadingSkeleton type="table" count={1} />;

    return (<div className="enterprise-container">
        <div className="enterprise-header-actions"><button className="add-override-btn" onClick={() => { setEditingOverride(null); setShowModal(true); }}><FiPlus /> Create Tenant Override</button><button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}><FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh</button></div>
        <BillingCard title="Tenant Overrides" icon={<FiAward />}>
            {overrides.length === 0 ? <EmptyState type="default" title="No overrides" message="Create custom pricing for enterprise tenants." /> : (<div className="overrides-table-container"><table className="overrides-table"><thead><tr><th>Tenant ID</th><th>Plan</th><th>Monthly Price</th><th>Yearly Price</th><th>Discount</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr></thead><tbody>{overrides.map(override => (<tr key={override.id}><td className="mono">{override.tenant_id?.slice(-12)}</td><td>{override.plan_name}</td><td>{override.custom_price_monthly ? <CurrencyFormatter amount={override.custom_price_monthly} showCents={false} /> : '-'}</td><td>{override.custom_price_yearly ? <CurrencyFormatter amount={override.custom_price_yearly} showCents={false} /> : '-'}</td><td>{override.discount_percentage ? `${override.discount_percentage}%` : '-'}</td><td>{override.valid_until ? new Date(override.valid_until).toLocaleDateString() : 'Indefinite'}</td><td><StatusBadge type="payment_method" status={override.is_active ? 'active' : 'expired'} size="sm" /></td><td className="actions"><button className="action-btn" onClick={() => { setEditingOverride(override); setShowModal(true); }}><FiEdit2 /></button><button className="action-btn danger" onClick={() => handleDelete(override.id)}><FiTrash2 /></button></td></tr>))}</tbody></table></div>)}
        </BillingCard>
        {showModal && <EnterpriseOverrideModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingOverride(null); }} override={editingOverride} onSuccess={handleRefresh} />}
    </div>);
};

export default EnterpriseOverridesManager;