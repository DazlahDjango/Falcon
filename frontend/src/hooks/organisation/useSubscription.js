import { useSelector, useDispatch } from 'react-redux';
import {
  fetchPlans,
  fetchCurrentSubscription,
  upgradeSubscription,
  cancelSubscription,
  clearSubscriptions,
} from '../../store/organisation/slice/subscriptionSlice';

export const useSubscription = () => {
  const dispatch = useDispatch();
  const { plans, currentSubscription, loading, error } = useSelector(
    (state) => state.subscription
  );

  const getPlans = () => {
    dispatch(fetchPlans());
  };

  const getCurrentSubscription = () => {
    dispatch(fetchCurrentSubscription());
  };

  const upgrade = (planId) => {
    return dispatch(upgradeSubscription(planId)).unwrap();
  };

  const cancel = () => {
    return dispatch(cancelSubscription()).unwrap();
  };

  const clear = () => {
    dispatch(clearSubscriptions());
  };

  return {
    plans,
    currentSubscription,
    loading,
    error,
    getPlans,
    getCurrentSubscription,
    upgradeSubscription: upgrade,
    cancelSubscription: cancel,
    clearSubscription: clear,
  };
};