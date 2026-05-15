import React, { useState } from 'react';
import { usePlans } from '../../../hooks/billing';
import { PlanFormModal } from './PlanFormModal';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { PriceDisplay } from '../shared/PriceDisplay';
import { StatusBadge } from '../shared/StatusBadge';

export const PlanManager = () => {
    const { plans, loading, fetchPlans, deletePlan } = usePlans();
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const handleDelete = async (planId) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        await deletePlan(planId);
        await fetchPlans(true);
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingPlan(null);
        fetchPlans(true);
    };

    if (loading) {
        return <LoadingSkeleton type="list" count={4} />;
    }

    return (
        <div className="plan-manager">
            <div className="plan-manager-header">
                <h3>Subscription Plans</h3>
                <button className="add-plan-btn" onClick={() => setShowModal(true)}>
                    + Add Plan
                </button>
            </div>

            {plans.length === 0 ? (
                <EmptyState 
                    title="No plans configured"
                    message="Create subscription plans for your customers"
                    icon="📋"
                />
            ) : (
                <div className="plans-table-container">
                    <table className="plans-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Monthly Price</th>
                                <th>Yearly Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.id}>
                                    <td><strong>{plan.name}</strong></td>
                                    <td>{plan.plan_type}</td>
                                    <td><PriceDisplay amount={plan.price} size="small" /></td>
                                    <td>{plan.yearly_price ? <PriceDisplay amount={plan.yearly_price} size="small" /> : '—'}</td>
                                    <td><StatusBadge status={plan.is_active ? 'active' : 'inactive'} /></td>
                                    <td className="actions-cell">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => handleEdit(plan)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(plan.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <PlanFormModal 
                isOpen={showModal}
                onClose={handleModalClose}
                plan={editingPlan}
            />
        </div>
    );
};

export default PlanManager;