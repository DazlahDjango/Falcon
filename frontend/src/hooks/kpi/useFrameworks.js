import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFrameworks,
    createFramework,
    updateFramework,
    deleteFramework,
    publishFramework,
    duplicateFramework,
    selectFrameworks,
    selectFrameworkLoading,
    selectFrameworkError
} from '../../store/kpi';

const useFrameworks = (initialParams = {}) => {
    const dispatch = useDispatch();
    
    const frameworks = useSelector(selectFrameworks);
    const loading = useSelector(selectFrameworkLoading);
    const error = useSelector(selectFrameworkError);
    
    const loadFrameworks = useCallback((params = {}) => {
        dispatch(fetchFrameworks(params));
    }, [dispatch]);
    
    const create = useCallback((data) => {
        return dispatch(createFramework(data)).unwrap();
    }, [dispatch]);
    
    const update = useCallback((id, data) => {
        return dispatch(updateFramework({ id, data })).unwrap();
    }, [dispatch]);
    
    const remove = useCallback((id) => {
        return dispatch(deleteFramework(id)).unwrap();
    }, [dispatch]);
    
    const publish = useCallback((id) => {
        return dispatch(publishFramework(id)).unwrap();
    }, [dispatch]);
    
    const duplicate = useCallback((id) => {
        return dispatch(duplicateFramework(id)).unwrap();
    }, [dispatch]);
    
    const refresh = useCallback(() => {
        loadFrameworks(initialParams);
    }, [loadFrameworks, initialParams]);
    
    useEffect(() => {
        loadFrameworks(initialParams);
    }, [loadFrameworks, initialParams]);
    
    return {
        frameworks,
        loading,
        error,
        create,
        update,
        remove,
        publish,
        duplicate,
        refresh,
    };
};

export default useFrameworks;