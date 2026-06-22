import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    selectCategories,
    selectFrameworkLoading,
    selectFrameworkError
} from '../../store/kpi';

const useCategories = (initialParams = {}) => {
    const dispatch = useDispatch();
    
    const categories = useSelector(selectCategories);
    const loading = useSelector(selectFrameworkLoading);
    const error = useSelector(selectFrameworkError);
    
    const loadCategories = useCallback((params = {}) => {
        dispatch(fetchCategories({ ...initialParams, ...params }));
    }, [dispatch, initialParams]);
    
    const create = useCallback(async (data) => {
        return dispatch(createCategory(data)).unwrap();
    }, [dispatch]);
    
    const update = useCallback(async (id, data) => {
        return dispatch(updateCategory({ id, data })).unwrap();
    }, [dispatch]);
    
    const remove = useCallback(async (id) => {
        return dispatch(deleteCategory(id)).unwrap();
    }, [dispatch]);
    
    const move = useCallback(async (id, parentId) => {
        return dispatch(moveCategory({ id, parentId })).unwrap();
    }, [dispatch]);
    
    useEffect(() => {
        loadCategories();
    }, [loadCategories]);
    
    return {
        categories,
        loading,
        error,
        create,
        update,
        delete: remove,
        move,
        refresh: loadCategories,
    };
};

export default useCategories;