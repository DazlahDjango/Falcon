/**
 * Organisation Subscription Page
 * Manage subscription plans, billing, and payment methods
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlans, fetchCurrentSubscription, fetchInvoices, fetchPaymentMethods } from '../../store/organisations/slice/subscriptionSlice';
import { SubscriptionManager } from '../../components/organisations/subscription/SubscriptionManager';

const OrganisationSubscriptionPage = () => {
  const dispatch = useDispatch();
  const { plans, currentSubscription, invoices, paymentMethods, loading } = useSelector((state) => state.subscription);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchCurrentSubscription());
    dispatch(fetchInvoices());
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  if (loading && !currentSubscription) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <SubscriptionManager
      plans={plans}
      currentSubscription={currentSubscription}
      invoices={invoices}
      paymentMethods={paymentMethods}
      loading={loading}
    />
  );
};

export default OrganisationSubscriptionPage;