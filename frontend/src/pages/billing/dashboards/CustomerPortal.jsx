import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerPortal } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { Spinner } from '../../components/common/LoadingSpinner';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const CustomerPortal = () => {
    const navigate = useNavigate();
    const createPortal = useCustomerPortal();
    useEffect(() => {
        const returnUrl = `${window.location.origin}${BILLING_ROUTES.CUSTOMER_PORTAL_RETURN}`;
        createPortal.mutate(returnUrl);
    }, []);
    if (createPortal.isPending) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Spinner size="lg" />
                <p className="text-gray-500 mt-4">Redirecting to secure customer portal...</p>
            </div>
        );
    }
    if (createPortal.isError) {
        return (
            <div className="max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Open Portal</h2>
                <p className="text-gray-500 mb-6">
                    {createPortal.error?.message || 'Failed to create portal session. Please try again later.'}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => navigate(BILLING_ROUTES.DASHBOARD)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => createPortal.mutate()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }  
    return null;
};
export default CustomerPortal;