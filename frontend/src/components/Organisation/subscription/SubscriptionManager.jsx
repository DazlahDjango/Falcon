import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PlanCard from './PlanCard';
import BillingHistory from './BillingHistory';
import PaymentMethodForm from './PaymentMethodForm';
import { subscriptionApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const SubscriptionManager = () => {
  const dispatch = useDispatch();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, subscriptionRes] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getCurrent(),
      ]);
      setPlans(plansRes.data.results || plansRes.data || []);
      setCurrentSubscription(subscriptionRes.data);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      setSelectedPlan(planId);
      // In production, redirect to Stripe checkout or show payment modal
      const response = await subscriptionApi.createCheckoutSession(planId);
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upgrade failed');
      setSelectedPlan(null);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await subscriptionApi.cancel();
      toast.success('Subscription cancelled successfully');
      setShowCancelModal(false);
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    try {
      await subscriptionApi.reactivate();
      toast.success('Subscription reactivated successfully');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reactivation failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isCancelled = currentSubscription?.status === 'cancelled';
  const daysUntilExpiry = currentSubscription?.days_until_expiry;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Current Subscription</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {currentSubscription.plan_name || currentSubscription.plan_type}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                    currentSubscription.is_active_subscription
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentSubscription.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Billing Cycle</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentSubscription.auto_renew ? 'Auto-renewal On' : 'Auto-renewal Off'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Next Billing Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentSubscription.end_date 
                    ? new Date(currentSubscription.end_date).toLocaleDateString() 
                    : 'N/A'}
                </dd>
              </div>
            </div>

            {/* Warning Messages */}
            {isExpiringSoon && !isCancelled && (
              <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Your subscription {currentSubscription.auto_renew ? 'will renew' : 'expires'} in {daysUntilExpiry} days.
                      {!currentSubscription.auto_renew && ' Please renew to continue service.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="mt-4 bg-blue-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-blue-700">
                    Your subscription has been cancelled. You will have access until {new Date(currentSubscription.end_date).toLocaleDateString()}.
                  </p>
                  <button
                    onClick={handleReactivate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Reactivate Subscription
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isCancelled && currentSubscription.auto_renew && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Available Plans</h2>
          <p className="text-sm text-gray-500 mt-1">Upgrade or change your plan anytime</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={currentSubscription?.plan?.id === plan.id || currentSubscription?.plan_type === plan.code}
                onUpgrade={() => handleUpgrade(plan.id)}
                onDowngrade={() => handleUpgrade(plan.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Billing History */}
      <BillingHistory />

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Subscription</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period on {currentSubscription?.end_date ? new Date(currentSubscription.end_date).toLocaleDateString() : 'your renewal date'}.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Processing...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-md w-full">
            <PaymentMethodForm
              onSuccess={() => {
                setShowPaymentModal(false);
                fetchData();
              }}
              onCancel={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;