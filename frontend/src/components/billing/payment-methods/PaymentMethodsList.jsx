import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PaymentMethodCard } from './PaymentMethodCard';
import { AddPaymentMethodForm } from './AddPaymentMethodForm';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { EmptyState } from '../shared/EmptyState';
import { usePaymentMethods } from '../../../hooks/billing';

export const PaymentMethodsList = ({ 
    showAddForm = true,
    onMethodAdded,
    onMethodDeleted,
    onDefaultChanged,
    className = '' 
}) => {
    const {
        paymentMethods,
        loading,
        error,
        defaultMethod,
        deletePaymentMethod,
        setDefaultPaymentMethod,
        fetchPaymentMethods,
    } = usePaymentMethods();

    const [deletingId, setDeletingId] = useState(null);
    const [settingDefaultId, setSettingDefaultId] = useState(null);
    const [showAddFormState, setShowAddFormState] = useState(false);

    const handleDelete = async (methodId) => {
        if (!confirm('Are you sure you want to remove this payment method?')) return;
        
        setDeletingId(methodId);
        try {
            await deletePaymentMethod(methodId);
            onMethodDeleted?.();
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetDefault = async (methodId) => {
        setSettingDefaultId(methodId);
        try {
            await setDefaultPaymentMethod(methodId);
            onDefaultChanged?.();
        } finally {
            setSettingDefaultId(null);
        }
    };

    const handleMethodAdded = () => {
        setShowAddFormState(false);
        onMethodAdded?.();
    };

    if (loading && paymentMethods.length === 0) {
        return <LoadingSkeleton type="list" count={2} />;
    }

    return (
        <div className={`payment-methods-container ${className}`}>
            <div className="payment-methods-header">
                <h3 className="payment-methods-title">Payment Methods</h3>
                {showAddForm && !showAddFormState && (
                    <button 
                        className="payment-methods-add-btn"
                        onClick={() => setShowAddFormState(true)}
                    >
                        + Add Payment Method
                    </button>
                )}
            </div>

            {error && (
                <div className="payment-methods-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {showAddFormState && (
                <div className="payment-methods-add-form-container">
                    <AddPaymentMethodForm 
                        onSuccess={handleMethodAdded}
                        onCancel={() => setShowAddFormState(false)}
                    />
                </div>
            )}

            {paymentMethods.length === 0 && !showAddFormState ? (
                <EmptyState 
                    title="No payment methods"
                    message="Add a payment method to enable automatic billing"
                    icon="💳"
                    action={
                        <button 
                            className="empty-state-btn"
                            onClick={() => setShowAddFormState(true)}
                        >
                            Add Payment Method
                        </button>
                    }
                />
            ) : (
                <div className="payment-methods-list">
                    {paymentMethods.map((method) => (
                        <PaymentMethodCard
                            key={method.id}
                            method={method}
                            isDefault={method.id === defaultMethod?.id}
                            onSetDefault={() => handleSetDefault(method.id)}
                            onDelete={() => handleDelete(method.id)}
                            deleting={deletingId === method.id}
                            settingDefault={settingDefaultId === method.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

PaymentMethodsList.propTypes = {
    showAddForm: PropTypes.bool,
    onMethodAdded: PropTypes.func,
    onMethodDeleted: PropTypes.func,
    onDefaultChanged: PropTypes.func,
    className: PropTypes.string,
};

export default PaymentMethodsList;