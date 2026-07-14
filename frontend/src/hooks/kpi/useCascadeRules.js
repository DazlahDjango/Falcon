import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCascadeRules,
    createCascadeRule,
    updateCascadeRule,
    deleteCascadeRule,
    setDefaultCascadeRule,
    selectCascadeRules,
    selectCascadeLoading,
    selectCascadeError,
} from '../../store/kpi';

const useCascadeRules = () => {
    const dispatch = useDispatch();
    
    const rules = useSelector(selectCascadeRules);
    const loading = useSelector(selectCascadeLoading);
    const error = useSelector(selectCascadeError);
    
    const loadRules = useCallback(() => {
        dispatch(fetchCascadeRules({ is_active: true }));
    }, [dispatch]);
    
    const create = useCallback(async (data) => {
        return dispatch(createCascadeRule(data)).unwrap();
    }, [dispatch]);
    
    const update = useCallback(async (id, data) => {
        return dispatch(updateCascadeRule({ id, data })).unwrap();
    }, [dispatch]);
    
    const remove = useCallback(async (id) => {
        return dispatch(deleteCascadeRule(id)).unwrap();
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
        update,
        remove,
        setDefault,
        refresh: loadRules,
        defaultRule: rules.find(r => r.is_default),
    };
};

export default useCascadeRules;