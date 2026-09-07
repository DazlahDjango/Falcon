import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CategoryList } from '../../../components/kpi';
import { fetchCategories, createCategory, updateCategory, deleteCategory, moveCategory, selectCategories, selectFrameworkLoading, selectFrameworkError } from '../../../store/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const CategoriesPage = () => {
    const dispatch = useDispatch();
    const { canManageCategories, isAuthenticated } = useKPIPermissions();

    const categories = useSelector(selectCategories);
    const loading = useSelector(selectFrameworkLoading);
    const error = useSelector(selectFrameworkError);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCategories({ is_active: true }));
        }
    }, [dispatch, isAuthenticated]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const handleCreate = async (data) => {
        await dispatch(createCategory(data)).unwrap();
        dispatch(fetchCategories({ is_active: true }));
    };

    const handleUpdate = async (id, data) => {
        await dispatch(updateCategory({ id, data })).unwrap();
        dispatch(fetchCategories({ is_active: true }));
    };

    const handleDelete = async (id) => {
        await dispatch(deleteCategory(id)).unwrap();
        dispatch(fetchCategories({ is_active: true }));
    };

    const handleMove = async (id, parentId) => {
        await dispatch(moveCategory({ id, parentId })).unwrap();
        dispatch(fetchCategories({ is_active: true }));
    };

    return (
        <div className="kpi-page-container">
            <CategoryList
                categories={categories}
                loading={loading}
                error={error}
                onCreate={canManageCategories ? handleCreate : null}
                onUpdate={canManageCategories ? handleUpdate : null}
                onDelete={canManageCategories ? handleDelete : null}
                onMove={canManageCategories ? handleMove : null}
                canManage={canManageCategories}
            />
        </div>
    );
};

export default CategoriesPage;