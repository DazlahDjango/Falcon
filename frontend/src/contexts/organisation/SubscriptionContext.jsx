import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscriptionApi } from '../../services/organisation/api';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, plansRes, invoicesRes, paymentRes] = await Promise.all([
        subscriptionApi.getCurrent(),
        subscriptionApi.getPlans(),
        subscriptionApi.getInvoices(),
        subscriptionApi.getPaymentMethods(),
      ]);
      setSubscription(subRes.data);
      setPlans(plansRes.data.results || plansRes.data || []);
      setInvoices(invoicesRes.data.results || invoicesRes.data || []);
      setPaymentMethods(paymentRes.data.results || paymentRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch subscription data');
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = async (planId) => {
    try {
      const response = await subscriptionApi.upgrade(planId);
      await fetchData();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await subscriptionApi.cancel();
      await fetchData();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const addPaymentMethod = async (paymentData) => {
    try {
      const response = await subscriptionApi.addPaymentMethod(paymentData);
      await fetchData();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const removePaymentMethod = async (methodId) => {
    try {
      await subscriptionApi.removePaymentMethod(methodId);
      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value = {
    subscription,
    plans,
    invoices,
    paymentMethods,
    loading,
    error,
    upgradePlan,
    cancelSubscription,
    addPaymentMethod,
    removePaymentMethod,
    refreshSubscription: fetchData,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};