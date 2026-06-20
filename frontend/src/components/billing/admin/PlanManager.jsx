import React, { useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiRefreshCw, FiDollarSign, FiUsers, FiDatabase, FiAward } from 'react-icons/fi';
import { BillingCard } from '../shared/BillingCard';
import { StatusBadge } from '../shared/StatusBadge';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { usePlans } from '../../../hooks/billing/usePlans';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { PlanFormModal } from './PlanFormModal';
import './admin.css';

export const PlanManager = () => {
    const { permissions } = useBillingPermissions();
    const { plans, loading, fetchAllPlans, deletePlan, syncToPaystack } = usePlans({ autoFetch: true });
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [syncing, setSyncing] = useState(null);

    const handleEdit = (plan) => { setEditingPlan(plan); setShowModal(true); };
    const handleDelete = async (id) => { if (window.confirm('Are you sure you want to delete this plan?')) await deletePlan(id); };
    const handleSync = async (id) => { setSyncing(id); await syncToPaystack(id); setSyncing(null); };

    if (!permissions.canManagePlans) return <EmptyState type="default" title="Access Denied" message="You don't have permission to manage plans." />;
    if (loading) return <LoadingSkeleton type="table" count={1} />;

    return (
        <>
            <BillingCard title="Plan Management" icon={<FiAward />} headerAction={<button className="plan-add-btn" onClick={() => { setEditingPlan(null); setShowModal(true); }}><FiPlus /> Add Plan</button>}>
                {plans.length === 0 ? <EmptyState type="plans" actionText="Add your first plan" onAction={() => setShowModal(true)} /> : (
                    <div className="plans-table-container">
                        <table className="plans-table">
                            <thead><tr><th>Plan Name</th><th>Type</th><th>Monthly Price</th><th>Yearly Price</th><th>Max Users</th><th>Max KPIs</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {plans.map(plan => (
                                    <tr key={plan.id}>
                                        <td><span className="plan-name">{plan.name}</span><span className="plan-slug">{plan.slug}</span></td>
                                        <td><StatusBadge type="subscription" status={plan.plan_type} size="sm" /></td>
                                        <td><CurrencyFormatter amount={plan.price} /></td>
                                        <td>{plan.yearly_price ? <CurrencyFormatter amount={plan.yearly_price} /> : '-'}</td>
                                        <td>{plan.max_users === -1 ? '∞' : plan.max_users}</td>
                                        <td>{plan.max_kpis === -1 ? '∞' : plan.max_kpis}</td>
                                        <td><StatusBadge type="payment_method" status={plan.is_active ? 'active' : 'removed'} size="sm" /></td>
                                        <td className="plan-actions">
                                            <button className="plan-action-btn" onClick={() => handleEdit(plan)}><FiEdit2 /></button>
                                            <button className="plan-action-btn" onClick={() => handleSync(plan.id)} disabled={syncing === plan.id}>{syncing === plan.id ? <FiRefreshCw className="spin" /> : <FiRefreshCw />}</button>
                                            <button className="plan-action-btn danger" onClick={() => handleDelete(plan.id)}><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </BillingCard>
            <PlanFormModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingPlan(null); }} plan={editingPlan} onSuccess={() => fetchAllPlans({})} />
        </>
    );
};

export default PlanManager;