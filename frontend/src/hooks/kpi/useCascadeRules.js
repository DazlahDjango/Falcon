import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCascadeRules,
    createCascadeRule,
    setDefaultCascadeRule,
    selectCascadeRules,
    selectTargetLoading,
    selectTargetError
} from '../../store/kpi';

const useCascadeRules = () => {
    const dispatch = useDispatch();
    
    const rules = useSelector(selectCascadeRules);
    const loading = useSelector(selectTargetLoading);
    const error = useSelector(selectTargetError);
    
    const loadRules = useCallback(() => {
        dispatch(fetchCascadeRules({ is_active: true }));
    }, [dispatch]);
    
    const create = useCallback(async (data) => {
        return dispatch(createCascadeRule(data)).unwrap();
    }, [dispatch]);
    
    const setDefault = useCallback(async (id) => {
        return dispatch(setDefaultCascadeRule(id)).unwrap();
    }, [dispatch]);
    
    useEffect(() => {
        loadRules();
    }, [loadRules]);
    
    return {
        rules,
        loading,
        error,
        create,
        setDefault,
        refresh: loadRules,
        defaultRule: rules.find(r => r.is_default),
    };
};

export default useCascadeRules;