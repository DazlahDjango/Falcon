import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { FiXCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

const CheckoutCancel = () => {
    const navigate = useNavigate();
    
    return (
        <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiXCircle className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Cancelled</h1>
            <p className="text-gray-500 mb-6">
                You have cancelled the checkout process. No charges have been made to your account.
            </p>
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Tell us why (optional)</h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input type="radio" name="reason" value="too_expensive" className="text-primary-600" />
                        <span className="text-sm text-gray-700">Plan is too expensive</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="radio" name="reason" value="missing_features" className="text-primary-600" />
                        <span className="text-sm text-gray-700">Missing features I need</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="radio" name="reason" value="just_browsing" className="text-primary-600" />
                        <span className="text-sm text-gray-700">Just browsing / evaluating</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="radio" name="reason" value="other" className="text-primary-600" />
                        <span className="text-sm text-gray-700">Other reason</span>
                    </label>
                </div>
            </div>
            <div className="space-y-3">
                <button
                    onClick={() => navigate(BILLING_ROUTES.PLANS)}
                    className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                    <FiRefreshCw className="w-5 h-5" />
                    View Plans Again
                </button>
                <button
                    onClick={() => navigate(BILLING_ROUTES.DASHBOARD)}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Return to Dashboard
                </button>
            </div>
            <p className="text-sm text-gray-400 mt-6">
                Need help choosing a plan? <a href="/contact" className="text-primary-600 hover:underline">Contact our sales team</a>
            </p>
        </div>
    );
};
export default CheckoutCancel;