import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TemplateList } from '../../../components/kpi';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate, publishTemplate, useTemplate, selectTemplates, selectFrameworkLoading, selectFrameworkError } from '../../../store/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate, useNavigate } from 'react-router-dom';
import { KPI_ROUTES } from '../../../config/constants/kpiRouteConstants';

const TemplatesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { canManageTemplates, isAuthenticated } = useKPIPermissions();
    
    const templates = useSelector(selectTemplates);
    const loading = useSelector(selectFrameworkLoading);
    const error = useSelector(selectFrameworkError);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchTemplates({ is_published: true }));
        }
    }, [dispatch, isAuthenticated]);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    const handleCreate = async (data) => {
        await dispatch(createTemplate(data)).unwrap();
        dispatch(fetchTemplates({ is_published: true }));
    };
    
    const handleUpdate = async (id, data) => {
        await dispatch(updateTemplate({ id, data })).unwrap();
        dispatch(fetchTemplates({ is_published: true }));
    };
    
    const handleDelete = async (id) => {
        await dispatch(deleteTemplate(id)).unwrap();
        dispatch(fetchTemplates({ is_published: true }));
    };
    
    const handlePublish = async (id) => {
        await dispatch(publishTemplate(id)).unwrap();
        dispatch(fetchTemplates({ is_published: true }));
    };
    
    const handleUse = async (template) => {
        // Navigate to KPI create with template pre-filled
        navigate(`${KPI_ROUTES.KPI_CREATE}?template=${template.id}`);
    };
    
    return (
        <div className="kpi-page-container">
            <TemplateList 
                templates={templates}
                loading={loading}
                error={error}
                onCreate={canManageTemplates ? handleCreate : null}
                onUpdate={canManageTemplates ? handleUpdate : null}
                onDelete={canManageTemplates ? handleDelete : null}
                onPublish={canManageTemplates ? handlePublish : null}
                onUse={handleUse}
                canManage={canManageTemplates}
            />
        </div>
    );
};

export default TemplatesPage;