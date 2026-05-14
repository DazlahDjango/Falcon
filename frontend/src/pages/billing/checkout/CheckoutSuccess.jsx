import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCheckoutSession } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { Spinner } from '../../../components/common/UI';
import { FiCheckCircle, FiRefreshCw, FiHome, FiFileText } from 'react-icons/fi';

const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [countdown, setCountdown] = useState(5);
    const { session, isLoading, error } = useCheckoutSession(sessionId);
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            navigate(BILLING_ROUTES.DASHBOARD);
        }
    }, [countdown, navigate]);
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    if (error) {
        return (
            <div className="max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiRefreshCw className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={() => navigate(BILLING_ROUTES.PLANS)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Back to Plans
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Successful!</h1>
            <p className="text-gray-500 mb-6">
                Thank you for subscribing to Falcon PMS. Your subscription has been activated.
            </p>
            {session && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-3">Subscription Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Plan:</span>
                            <span className="font-medium text-gray-900">
                                {session.metadata?.plan_type || 'Premium Plan'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Billing:</span>
                            <span className="font-medium text-gray-900 capitalize">
                                {session.metadata?.billing_interval}ly
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount:</span>
                            <span className="font-medium text-gray-900">
                                {session.currency} {(session.amount_total || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <span className="font-medium text-green-600">Active</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        Start setting up your KPIs and performance metrics
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        Invite your team members to join your organization
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        Explore advanced features like reports and analytics
                    </li>
                </ul>
            </div>
            <div className="space-y-3">
                <button
                    onClick={() => navigate(BILLING_ROUTES.DASHBOARD)}
                    className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                    Go to Billing Dashboard
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    <FiHome className="w-5 h-5" />
                    Go to Main Dashboard
                </button>
            </div>
            <p className="text-sm text-gray-400 mt-6">
                Redirecting to dashboard in {countdown} seconds...
            </p>
        </div>
    );
};
export default CheckoutSuccess;