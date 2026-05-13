import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentMethods, useDeletePaymentMethod, useSetDefaultPaymentMethod } from '../../../hooks/billing';
import PaymentMethodCard from '../../../components/billing/PaymentMethodCard';
import AddPaymentMethodModal from '../../../components/billing/AddPaymentMethodModal';
import { Spinner } from '../../../components/common/UI';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { PlusIcon, CreditCardIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const PaymentMethodList = () => {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { data: methods, isLoading, refetch } = usePaymentMethods();
    const deletePaymentMethod = useDeletePaymentMethod();
    const setDefault = useSetDefaultPaymentMethod();
    const handleDelete = async () => {
        if (deleteTarget) {
            await deletePaymentMethod.mutateAsync(deleteTarget);
            await refetch();
            setDeleteTarget(null);
            setShowDeleteConfirm(false);
        }
    };
    const handleSetDefault = async (methodId) => {
        await setDefault.mutateAsync(methodId);
        await refetch();
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    const defaultMethod = methods?.find(m => m.is_default);
    const otherMethods = methods?.filter(m => !m.is_default) || [];
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/app/billing/dashboard')}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
                        <p className="text-gray-500 mt-1">Manage your saved payment methods</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Payment Method
                </button>
            </div>
            {defaultMethod && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-md font-semibold text-gray-900 mb-4">Default Payment Method</h2>
                    <PaymentMethodCard
                        method={defaultMethod}
                        isDefault={true}
                        onDelete={() => {
                            setDeleteTarget(defaultMethod.id);
                            setShowDeleteConfirm(true);
                        }}
                    />
                </div>
            )}
            {otherMethods.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-md font-semibold text-gray-900 mb-4">Other Payment Methods</h2>
                    <div className="space-y-3">
                        {otherMethods.map((method) => (
                            <PaymentMethodCard
                                key={method.id}
                                method={method}
                                isDefault={false}
                                onSetDefault={handleSetDefault}
                                onDelete={() => {
                                    setDeleteTarget(method.id);
                                    setShowDeleteConfirm(true);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
            {(!methods || methods.length === 0) && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h3>
                    <p className="text-gray-500 mb-4">Add your first payment method to manage subscriptions.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Add Payment Method
                    </button>
                </div>
            )}
            <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    🔒 Your payment information is securely stored with Stripe. We never store full card details on our servers.
                </p>
            </div>
            <AddPaymentMethodModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={refetch}
            />
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                }}
                onConfirm={handleDelete}
                title="Delete Payment Method"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deletePaymentMethod.isLoading}
            >
                <p className="text-gray-600">
                    Are you sure you want to delete this payment method?
                    {deleteTarget === defaultMethod?.id && " This is your default payment method. You'll need to set a new default."}
                </p>
            </ConfirmDialog>
        </div>
    );
};
export default PaymentMethodList;