import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FrameworkList } from '../../../components/kpi';
import { fetchFrameworks, createFramework, updateFramework, deleteFramework, publishFramework, archiveFramework, duplicateFramework, selectFrameworks, selectFrameworkLoading, selectFrameworkError } from '../../../store/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const FrameworksPage = () => {
    const dispatch = useDispatch();
    const { canManageFrameworks, isAuthenticated } = useKPIPermissions();
    
    const frameworks = useSelector(selectFrameworks);
    const loading = useSelector(selectFrameworkLoading);
    const error = useSelector(selectFrameworkError);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    const handleCreate = async (data) => {
        await dispatch(createFramework(data)).unwrap();
        dispatch(fetchFrameworks({ is_active: true }));
    };
    
    const handleUpdate = async (id, data) => {
        await dispatch(updateFramework({ id, data })).unwrap();
        dispatch(fetchFrameworks({ is_active: true }));
    };
    
    const handleDelete = async (id) => {
        await dispatch(deleteFramework(id)).unwrap();
        dispatch(fetchFrameworks({ is_active: true }));
    };
    
    const handlePublish = async (id) => {
        await dispatch(publishFramework(id)).unwrap();
        dispatch(fetchFrameworks({ is_active: true }));
    };
    
    const handleArchive = async (id) => {
        await dispatch(archiveFramework(id)).unwrap();
        dispatch(fetchFrameworks({ is_active: true }));
    };
    
    const handleDuplicate = async (id) => {
        await dispatch(duplicateFramework(id)).unwrap();
        dispatch(fetchFrameworks({ is_active: true }));
    };
    
    return (
        <div className="kpi-page-container">
            <FrameworkList 
                frameworks={frameworks}
                loading={loading}
                error={error}
                onCreate={canManageFrameworks ? handleCreate : null}
                onUpdate={canManageFrameworks ? handleUpdate : null}
                onDelete={canManageFrameworks ? handleDelete : null}
                onPublish={canManageFrameworks ? handlePublish : null}
                onArchive={canManageFrameworks ? handleArchive : null}
                onDuplicate={canManageFrameworks ? handleDuplicate : null}
                canManage={canManageFrameworks}
            />
        </div>
    );
};

export default FrameworksPage;