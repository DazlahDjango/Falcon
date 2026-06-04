import React, { useState, useCallback } from 'react';
import { FiPlus, FiCreditCard, FiBank, FiSmartphone, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { BillingShell } from '../common/BillingShell';
import { BillingCard } from '../shared/BillingCard';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { usePaymentMethods } from '../../../hooks/billing/usePaymentMethods';
import { useBillingPermissions } from '../../../hooks/billing/useBillingPermissions';
import { PaymentMethodCard } from './PaymentMethodCard';
import { AddPaymentMethodForm } from './AddPaymentMethodForm';
import { DeletePaymentMethodModal } from './DeletePaymentMethodModal';
import './payment-methods.css';

export const PaymentMethodsList = () => {
    const { permissions } = useBillingPermissions();
    const { paymentMethods, loading, fetchAll, remove, setDefault, defaultMethod } = usePaymentMethods({ autoFetch: true });
    const [showAddForm, setShowAddForm] = useState(false);
    const [deletingMethod, setDeletingMethod] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAll();
        setRefreshing(false);
    }, [fetchAll]);

    const handleDelete = async (id) => { await remove(id); setDeletingMethod(null); };
    const handleSetDefault = async (id) => { await setDefault(id); };

    const cardMethods = paymentMethods.filter(m => m.payment_type === 'card');
    const bankMethods = paymentMethods.filter(m => m.payment_type === 'bank');
    const mobileMethods = paymentMethods.filter(m => m.payment_type === 'mobile_money');

    if (loading && paymentMethods.length === 0) return <LoadingSkeleton type="card" count={3} />;

    return (
        <BillingShell title="Payment Methods" subtitle="Manage your saved payment methods for automatic billing">
            <div className="payment-methods-container">
                <div className="payment-methods-header">
                    <div className="payment-methods-stats">
                        <div className="stat-badge"><FiCreditCard /> {cardMethods.length} Cards</div>
                        <div className="stat-badge"><FiBank /> {bankMethods.length} Banks</div>
                        <div className="stat-badge"><FiSmartphone /> {mobileMethods.length} Mobile</div>
                    </div>
                    <div className="payment-methods-actions">
                        <button className="refresh-btn" onClick={handleRefresh} disabled={refreshing}><FiRefreshCw className={refreshing ? 'spin' : ''} /> Refresh</button>
                        {permissions.canManagePaymentMethods && <button className="add-method-btn" onClick={() => setShowAddForm(true)}><FiPlus /> Add Payment Method</button>}
                    </div>
                </div>

                {paymentMethods.length === 0 ? (
                    <EmptyState type="payment_methods" actionText="Add your first payment method" onAction={() => setShowAddForm(true)} />
                ) : (
                    <div className="payment-methods-grid">
                        {paymentMethods.map(method => (
                            <PaymentMethodCard
                                key={method.id}
                                method={method}
                                isDefault={defaultMethod?.id === method.id}
                                onSetDefault={() => handleSetDefault(method.id)}
                                onDelete={() => setDeletingMethod(method)}
                                canManage={permissions.canManagePaymentMethods}
                            />
                        ))}
                    </div>
                )}

                {showAddForm && <AddPaymentMethodForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); handleRefresh(); }} />}
                {deletingMethod && <DeletePaymentMethodModal method={deletingMethod} onConfirm={() => handleDelete(deletingMethod.id)} onClose={() => setDeletingMethod(null)} />}
            </div>
        </BillingShell>
    );
};

export default PaymentMethodsList;