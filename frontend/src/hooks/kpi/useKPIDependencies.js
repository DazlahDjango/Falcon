import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDependencies,
    createDependency,
    deleteDependency,
    selectDependencies,
    selectKPILoading
} from '../../store/kpi';

const useKPIDependencies = (kpiId) => {
    const dispatch = useDispatch();
    
    const dependencies = useSelector(selectDependencies);
    const loading = useSelector(selectKPILoading);
    
    const loadDependencies = useCallback(() => {
        if (kpiId) {
            dispatch(fetchDependencies({ kpiId }));
        }
    }, [dispatch, kpiId]);
    
    const add = useCallback(async (data) => {
        return dispatch(createDependency(data)).unwrap();
    }, [dispatch]);
    
    const remove = useCallback(async (id) => {
        return dispatch(deleteDependency(id)).unwrap();
    }, [dispatch]);
    
    useEffect(() => {
        loadDependencies();
    }, [loadDependencies]);
    
    return {
        dependencies,
        loading,
        add,
        remove,
        refresh: loadDependencies,
    };
};

export default useKPIDependencies;