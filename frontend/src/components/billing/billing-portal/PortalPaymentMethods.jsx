import React, { useState } from 'react';
import { FiCreditCard, FiPlus, FiStar, FiTrash2, FiSmartphone, FiBank } from 'react-icons/fi';
import { BillingCard } from '../shared/BillingCard';
import { CardBrandIcon } from '../shared/CardBrandIcon';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { usePaymentMethods } from '../../../hooks/billing/usePaymentMethods';
import { AddPaymentMethodForm } from '../payment-methods/AddPaymentMethodForm';
import { DeletePaymentMethodModal } from '../payment-methods/DeletePaymentMethodModal';
import './billing-portal.css';

export const PortalPaymentMethods = ({ paymentMethods, loading, onUpdate }) => {
    const { setDefault, remove } = usePaymentMethods();
    const [showAddForm, setShowAddForm] = useState(false);
    const [deletingMethod, setDeletingMethod] = useState(null);

    const handleSetDefault = async (id) => { await setDefault(id); if (onUpdate) onUpdate(); };
    const handleDelete = async (id) => { await remove(id); setDeletingMethod(null); if (onUpdate) onUpdate(); };

    const getMethodIcon = (method) => {
        if (method.payment_type === 'card') return <CardBrandIcon brand={method.card_brand} size={24} />;
        if (method.payment_type === 'bank') return <FiBank />;
        if (method.payment_type === 'mobile_money') return <FiSmartphone />;
        return <FiCreditCard />;
    };

    if (loading) return <LoadingSkeleton type="card" count={2} />;

    return (
        <div className="portal-payment-methods">
            <div className="payment-methods-header">
                <h3>Saved Payment Methods</h3>
                <button className="add-method-btn" onClick={() => setShowAddForm(true)}><FiPlus /> Add Payment Method</button>
            </div>

            {paymentMethods.length === 0 ? <EmptyState type="payment_methods" actionText="Add your first payment method" onAction={() => setShowAddForm(true)} /> : (
                <div className="payment-methods-list">
                    {paymentMethods.map(method => (
                        <div key={method.id} className={`payment-method-row ${method.is_default ? 'default' : ''}`}>
                            <div className="method-icon">{getMethodIcon(method)}</div>
                            <div className="method-info"><div className="method-name">{method.display_name}</div><div className="method-detail">{method.email}</div>{method.card_expiry_month && <div className="method-expiry">Expires {method.card_expiry_month}/{method.card_expiry_year}</div>}</div>
                            <div className="method-actions">
                                {method.is_default ? <span className="default-badge"><FiStar /> Default</span> : <button className="method-action set-default" onClick={() => handleSetDefault(method.id)}>Set Default</button>}
                                <button className="method-action delete" onClick={() => setDeletingMethod(method)}><FiTrash2 /> Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddForm && <AddPaymentMethodForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); if (onUpdate) onUpdate(); }} />}
            {deletingMethod && <DeletePaymentMethodModal method={deletingMethod} onConfirm={() => handleDelete(deletingMethod.id)} onClose={() => setDeletingMethod(null)} />}
        </div>
    );
};

export default PortalPaymentMethods;