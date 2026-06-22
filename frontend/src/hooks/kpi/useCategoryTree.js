import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCategories,
    moveCategory,
    reorderCategories,
    selectCategories,
    selectCategoryTree,
    selectFrameworkLoading
} from '../../store/kpi';

const useCategoryTree = (frameworkId) => {
    const dispatch = useDispatch();
    
    const categories = useSelector(selectCategories);
    const categoryTree = useSelector(selectCategoryTree);
    const loading = useSelector(selectFrameworkLoading);
    
    const buildTree = useCallback((items, parentId = null) => {
        return items
            .filter(item => item.parent === parentId || (parentId === null && !item.parent))
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map(item => ({
                ...item,
                children: buildTree(items, item.id),
            }));
    }, []);
    
    const loadTree = useCallback(() => {
        if (frameworkId) {
            dispatch(fetchCategories({ framework: frameworkId }));
        }
    }, [dispatch, frameworkId]);
    
    const move = useCallback(async (id, parentId) => {
        const result = await dispatch(moveCategory({ id, parentId })).unwrap();
        loadTree();
        return result;
    }, [dispatch, loadTree]);
    
    const reorder = useCallback(async (orderedCategories) => {
        const categoriesList = orderedCategories.map((item, index) => ({
            id: item.id,
            display_order: index,
        }));
        const result = await dispatch(reorderCategories(categoriesList)).unwrap();
        loadTree();
        return result;
    }, [dispatch, loadTree]);
    
    useEffect(() => {
        if (frameworkId) {
            loadTree();
        }
    }, [frameworkId, loadTree]);
    
    return {
        flatCategories: categories,
        categoryTree: buildTree(categories),
        loading,
        move,
        reorder,
        refresh: loadTree,
    };
};

export default useCategoryTree;