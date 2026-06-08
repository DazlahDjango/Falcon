/**
 * Hook for managing single framework
 */
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFramework,
    updateFramework,
    publishFramework,
    duplicateFramework,
    selectCurrentFramework,
    selectFrameworkLoading,
    selectFrameworkError
} from '../../store/kpi';

const useFramework = (id) => {
    const dispatch = useDispatch();
    
    const framework = useSelector(selectCurrentFramework);
    const loading = useSelector(selectFrameworkLoading);
    const error = useSelector(selectFrameworkError);
    
    const loadFramework = useCallback(() => {
        if (id) {
            dispatch(fetchFramework(id));
        }
    }, [dispatch, id]);
    
    const update = useCallback(async (data) => {
        return dispatch(updateFramework({ id, data })).unwrap();
    }, [dispatch, id]);
    
    const publish = useCallback(async () => {
        return dispatch(publishFramework(id)).unwrap();
    }, [dispatch, id]);
    
    const duplicate = useCallback(async () => {
        return dispatch(duplicateFramework(id)).unwrap();
    }, [dispatch, id]);
    
    useEffect(() => {
        if (id) {
            loadFramework();
        }
    }, [id, loadFramework]);
    
    return {
        framework,
        loading,
        error,
        update,
        publish,
        duplicate,
        refresh: loadFramework,
    };
};

export default useFramework;