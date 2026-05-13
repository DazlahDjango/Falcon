import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripeElements, useAddPaymentMethod } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { Spinner } from '../../components/common/LoadingSpinner';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const PaymentMethodAdd = () => {
    const navigate = useNavigate();
    const [setAsDefault, setSetAsDefault] = useState(true);
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
    React.useEffect(() => {
        initializeElements();
    }, [initializeElements]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cardElement) {
            return;
        }
        setIsSubmitting(true);
        try {
            const paymentMethod = await confirmSetup(setAsDefault);
            await addPaymentMethod.mutateAsync({
                paymentMethodId: paymentMethod.id,
                setAsDefault: setAsDefault,
            });
            navigate(BILLING_ROUTES.PAYMENT_METHODS);
        } catch (error) {
            console.error('Failed to add payment method:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(BILLING_ROUTES.PAYMENT_METHODS)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Payment Method</h1>
                    <p className="text-gray-500 mt-1">Securely add a new credit/debit card or payment method</p>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Information
                        </label>
                        <div 
                            ref={setCardElementRef}
                            className="border border-gray-300 rounded-lg p-3 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500"
                        />
                        {elementsLoading && (
                            <div className="flex justify-center py-4">
                                <Spinner size="sm" />
                            </div>
                        )}
                        {elementsError && (
                            <p className="text-sm text-red-600 mt-2">{elementsError}</p>
                        )}
                    </div>
                    <div className="mb-6">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={setAsDefault}
                                onChange={(e) => setSetAsDefault(e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">
                                Set as default payment method
                            </span>
                        </label>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-md font-medium text-gray-900 mb-3">Billing Address (Optional)</h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Street Address"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                            <div className="grid grid-cols-2 gap-3">
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
                            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500">
                                <option value="KE">Kenya</option>
                                <option value="UG">Uganda</option>
                                <option value="TZ">Tanzania</option>
                                <option value="US">United States</option>
                                <option value="GB">United Kingdom</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                            <span>Your payment information is securely processed by Stripe. We never store your full card details.</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(BILLING_ROUTES.PAYMENT_METHODS)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || elementsLoading || !cardElement}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Payment Method'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default PaymentMethodAdd;