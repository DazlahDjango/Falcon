import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { Spinner } from '../../../components/common/UI';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const CustomerPortalReturn = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate(BILLING_ROUTES.DASHBOARD);
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigate]);
    
    return (
        <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Returning to Dashboard</h2>
            <p className="text-gray-500 mb-4">
                Your subscription changes have been saved. Redirecting you back to the billing dashboard...
            </p>
            <Spinner size="md" />
        </div>
    );
};
export default CustomerPortalReturn;