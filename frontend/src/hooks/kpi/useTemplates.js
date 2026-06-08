import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    publishTemplate,
    useTemplate,
    selectTemplates,
    selectFrameworkLoading,
    selectFrameworkError
} from '../../store/kpi';

const useTemplates = (initialParams = {}) => {
    const dispatch = useDispatch();
    
    const templates = useSelector(selectTemplates);
    const loading = useSelector(selectFrameworkLoading);
    const error = useSelector(selectFrameworkError);
    
    const loadTemplates = useCallback((params = {}) => {
        dispatch(fetchTemplates({ ...initialParams, ...params }));
    }, [dispatch, initialParams]);
    
    const create = useCallback(async (data) => {
        return dispatch(createTemplate(data)).unwrap();
    }, [dispatch]);
    
    const update = useCallback(async (id, data) => {
        return dispatch(updateTemplate({ id, data })).unwrap();
    }, [dispatch]);
    
    const remove = useCallback(async (id) => {
        return dispatch(deleteTemplate(id)).unwrap();
    }, [dispatch]);
    
    const publish = useCallback(async (id) => {
        return dispatch(publishTemplate(id)).unwrap();
    }, [dispatch]);
    
    const applyToKPI = useCallback(async (id, frameworkId) => {
        return dispatch(useTemplate({ id, frameworkId })).unwrap();
    }, [dispatch]);
    
    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);
    
    return {
        templates,
        loading,
        error,
        create,
        update,
        delete: remove,
        publish,
        applyToKPI,
        refresh: loadTemplates,
    };
};

export default useTemplates;