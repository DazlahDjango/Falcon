import { useState, useEffect } from 'react';
import { planApi } from '../../services/organisations/api';

export const usePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await planApi.list();
      setPlans(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch plans');
      console.error('Plans fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (planId, billingCycle) => {
    try {
      const response = await planApi.subscribe(planId, { billing_cycle: billingCycle });
      return response.data;
    } catch (err) {
      console.error('Plan subscription error:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    subscribeToPlan,
  };
};