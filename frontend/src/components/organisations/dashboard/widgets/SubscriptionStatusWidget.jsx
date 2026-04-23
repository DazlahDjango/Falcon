import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useSubscription } from '@/hooks/organisations';
import { useAuthContext } from '@/contexts/accounts/AuthContext';

const SubscriptionStatusWidget = () => {
  const { isAuthenticated } = useAuthContext();
  const { currentSubscription: subscription, loading, getCurrentSubscription } = useSubscription();

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentSubscription();
    }
  }, [isAuthenticated]);

  const getStatusBadge = () => {
    if (!subscription) return null;
    
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      trialing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Trial' },
      past_due: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Past Due' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expired' },
    };
    
    const config = statusConfig[subscription.status] || statusConfig.active;
    return (
      <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getDaysRemaining = () => {
    if (!subscription?.end_date) return null;
    const endDate = new Date(subscription.end_date);
    if (isNaN(endDate.getTime())) return null;
    const days = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days;
  };

  const daysRemaining = getDaysRemaining();
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;

  if (loading && !subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription</h3>
        <p className="text-gray-500 text-center py-4">No active subscription</p>
        <Link to="/organisation/subscription" className="block text-center text-indigo-600 hover:text-indigo-900">
          Get Started →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Subscription</h3>
          <Link to="/organisation/subscription" className="text-sm text-indigo-600 hover:text-indigo-900">
            Manage →
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-xl font-bold text-gray-900">
              {subscription.plan_name || subscription.plan_type}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {subscription.end_date && !isNaN(new Date(subscription.end_date).getTime()) && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Billing Cycle</span>
              <span className="text-gray-900">{format(new Date(subscription.end_date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isExpiringSoon ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${Math.max(0, Math.min(100, (daysRemaining / 365) * 100))}%` }}
              />
            </div>
            {isExpiringSoon && (
              <p className="text-xs text-yellow-600 mt-2">
                ⚠️ Expires in {daysRemaining} days
              </p>
            )}
          </div>
        )}

        {subscription.trial_end_date && subscription.status === 'trialing' && !isNaN(new Date(subscription.trial_end_date).getTime()) && (
          <div className="mt-4 bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              🎉 Trial ends {format(new Date(subscription.trial_end_date), 'MMM dd, yyyy')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatusWidget;