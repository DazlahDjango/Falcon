import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPlans, fetchPublicPlans, fetchPlanComparison, fetchPlanById,
    createPlan, updatePlan, deletePlan, syncPlanToPaystack,
    setFilters, clearFilters, setSelectedPlan, clearSelectedPlan, clearError,
} from '../../store/billing/slices/planSlice';
import {
    selectAllPlans, selectPublicPlans, selectPlanComparison, selectSelectedPlan,
    selectPlansLoading, selectPlansError, selectPlanFilters,
} from '../../store/billing/selectors';

export const usePlans = (options = { autoFetch: false }) => {
    const dispatch = useDispatch();
    const plans = useSelector(selectAllPlans);
    const publicPlans = useSelector(selectPublicPlans);
    const comparison = useSelector(selectPlanComparison);
    const selectedPlan = useSelector(selectSelectedPlan);
    const loading = useSelector(selectPlansLoading);
    const error = useSelector(selectPlansError);
    const filters = useSelector(selectPlanFilters);

    const fetchAllPlans = useCallback((params) => dispatch(fetchPlans({ params })), [dispatch]);
    const fetchPublic = useCallback(() => dispatch(fetchPublicPlans()), [dispatch]);
    const fetchComparison = useCallback(() => dispatch(fetchPlanComparison()), [dispatch]);
    const fetchById = useCallback((id) => dispatch(fetchPlanById(id)), [dispatch]);
    const addPlan = useCallback((data) => dispatch(createPlan(data)), [dispatch]);
    const editPlan = useCallback((id, data) => dispatch(updatePlan({ id, planData: data })), [dispatch]);
    const removePlan = useCallback((id) => dispatch(deletePlan(id)), [dispatch]);
    const syncToPaystack = useCallback((id) => dispatch(syncPlanToPaystack(id)), [dispatch]);
    const applyFilters = useCallback((newFilters) => dispatch(setFilters(newFilters)), [dispatch]);
    const resetFilters = useCallback(() => dispatch(clearFilters()), [dispatch]);
    const selectPlan = useCallback((plan) => dispatch(setSelectedPlan(plan)), [dispatch]);
    const clearSelected = useCallback(() => dispatch(clearSelectedPlan()), [dispatch]);
    const clearPlanError = useCallback(() => dispatch(clearError()), [dispatch]);

    useEffect(() => { if (options.autoFetch) fetchPublic(); }, [options.autoFetch, fetchPublic]);

    return {
        plans, publicPlans, comparison, selectedPlan, loading, error, filters,
        fetchAllPlans, fetchPublic, fetchComparison, fetchById,
        addPlan, editPlan, removePlan, syncToPaystack,
        applyFilters, resetFilters, selectPlan, clearSelected, clearPlanError,
    };
};

export default usePlans;