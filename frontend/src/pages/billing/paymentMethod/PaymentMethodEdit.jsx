import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePaymentMethod } from '../../../hooks/billing/usePaymentMethods';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { Spinner } from '../../../components/common/UI';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

const PaymentMethodEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const { data: method, isLoading } = usePaymentMethod(id);
    const [formData, setFormData] = useState({
        billing_name: '',
        billing_email: '',
        billing_address: {
            line1: '',
            line2: '',
            city: '',
            postal_code: '',
            country: 'KE',
        },
    });
    React.useEffect(() => {
        if (method) {
            setFormData({
                billing_name: method.billing_name || '',
                billing_email: method.billing_email || '',
                billing_address: {
                    line1: method.billing_address?.line1 || '',
                    line2: method.billing_address?.line2 || '',
                    city: method.billing_address?.city || '',
                    postal_code: method.billing_address?.postal_code || '',
                    country: method.billing_address?.country || 'KE',
                },
            });
        }
    }, [method]);
    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        navigate(BILLING_ROUTES.PAYMENT_METHODS);
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    if (!method) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Payment method not found.</p>
                <button
                    onClick={() => navigate(BILLING_ROUTES.PAYMENT_METHODS)}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                >
                    Back to Payment Methods
                </button>
            </div>
        );
    }
    const displayName = method.method_type === 'card' 
        ? `${method.brand?.toUpperCase()} •••• ${method.last4}`
        : method.billing_name || 'Payment Method';
    
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(BILLING_ROUTES.PAYMENT_METHODS)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Payment Method</h1>
                    <p className="text-gray-500 mt-1">{displayName}</p>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Card Details (read-only)</p>
                        <p className="font-medium text-gray-900 mt-1">
                            {method.brand?.toUpperCase()} •••• {method.last4}
                        </p>
                        {method.exp_month && method.exp_year && (
                            <p className="text-sm text-gray-500 mt-1">
                                Expires: {method.exp_month}/{method.exp_year}
                            </p>
                        )}
                    </div>
                    <div className="mb-6">
                        <h3 className="text-md font-medium text-gray-900 mb-3">Billing Information</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.billing_name}
                                    onChange={(e) => handleChange('billing_name', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    placeholder="Name on card"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.billing_email}
                                    onChange={(e) => handleChange('billing_email', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    placeholder="billing@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.billing_address.line1}
                                    onChange={(e) => handleChange('billing_address.line1', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Line 2 (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.billing_address.line2}
                                    onChange={(e) => handleChange('billing_address.line2', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.billing_address.city}
                                        onChange={(e) => handleChange('billing_address.city', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.billing_address.postal_code}
                                        onChange={(e) => handleChange('billing_address.postal_code', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                </label>
                                <select
                                    value={formData.billing_address.country}
                                    onChange={(e) => handleChange('billing_address.country', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                >
                                    <option value="KE">Kenya</option>
                                    <option value="UG">Uganda</option>
                                    <option value="TZ">Tanzania</option>
                                    <option value="US">United States</option>
                                    <option value="GB">United Kingdom</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate(BILLING_ROUTES.PAYMENT_METHODS)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default PaymentMethodEdit;