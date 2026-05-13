import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useStripeElements } from '../../hooks/billing/useStripeElements';
import { useAddPaymentMethod } from '../../hooks/billing/usePaymentMethods';

const AddPaymentMethodModal = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cardElementRef, setCardElementRef] = useState(null);
    const { 
        initializeElements, 
        confirmSetup, 
        cardElement, 
        isLoading: elementsLoading,
        error: elementsError 
    } = useStripeElements();
    const addPaymentMethod = useAddPaymentMethod();
    useEffect(() => {
        if (isOpen && !cardElement) {
            initializeElements();
        }
    }, [isOpen, cardElement, initializeElements]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cardElement) {
            return;
        }
        setIsSubmitting(true);
        try {
            const paymentMethod = await confirmSetup(true);
            await addPaymentMethod.mutateAsync({
                paymentMethodId: paymentMethod.id,
                setAsDefault: true,
            });      
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to add payment method:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Add Payment Method
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Card Information
                                </label>
                                <div 
                                    ref={setCardElementRef}
                                    className="border border-gray-300 rounded-lg p-3 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500"
                                />
                                {elementsLoading && (
                                    <p className="text-sm text-gray-500 mt-2">Loading payment form...</p>
                                )}
                                {elementsError && (
                                    <p className="text-sm text-red-600 mt-2">{elementsError}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Billing Address (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                />
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="mb-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                                <p>🔒 Your payment information is securely processed by Stripe. 
                                   We never store your full card details.</p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || elementsLoading || !cardElement}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Payment Method'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

AddPaymentMethodModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
};
export default AddPaymentMethodModal;