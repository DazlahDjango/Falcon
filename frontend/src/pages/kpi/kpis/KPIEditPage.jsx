import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKPI, updateKPI, selectCurrentKPI, selectKPILoadingDetails } from '../../../store/kpi';
import { KPIEditBasic, KPIEditConfig, KPIEditAssignments, KPIActivateDeactivate } from '../../../components/kpi';
import KPILoading from '../../../components/kpi/common/KPILoading';
import { useKPIPermissions } from '../../../hooks/kpi';

const KPIEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { canManageKPIs } = useKPIPermissions();
    const [activeTab, setActiveTab] = useState('basic');
    
    const kpi = useSelector(selectCurrentKPI);
    const loading = useSelector(selectKPILoadingDetails);
    
    useEffect(() => {
        if (id && canManageKPIs) {
            dispatch(fetchKPI(id));
        }
    }, [dispatch, id, canManageKPIs]);
    
    const handleUpdate = async (data) => {
        await dispatch(updateKPI({ id, data })).unwrap();
        navigate(`/kpis/${id}`);
    };
    
    const handleBack = () => {
        navigate(`/kpis/${id}`);
    };
    
    if (!canManageKPIs) {
        navigate('/kpis');
        return null;
    }
    
    if (loading) {
        return <KPILoading text="Loading KPI data..." />;
    }
    
    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'config', label: 'Configuration' },
        { id: 'assignments', label: 'Assignments' },
        { id: 'actions', label: 'Actions' }
    ];
    
    return (
        <div className="kpi-page-container">
            <div className="kpi-edit-header">
                <button className="back-btn" onClick={handleBack}>← Back</button>
                <h1>Edit KPI: {kpi?.name}</h1>
            </div>
            
            <div className="kpi-edit-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`edit-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="kpi-edit-content">
                {activeTab === 'basic' && (
                    <KPIEditBasic kpi={kpi} onSave={handleUpdate} onCancel={handleBack} />
                )}
                {activeTab === 'config' && (
                    <KPIEditConfig kpi={kpi} onSave={handleUpdate} onCancel={handleBack} />
                )}
                {activeTab === 'assignments' && (
                    <KPIEditAssignments kpi={kpi} onSave={handleUpdate} onCancel={handleBack} />
                )}
                {activeTab === 'actions' && (
                    <KPIActivateDeactivate kpi={kpi} onComplete={handleBack} />
                )}
            </div>
        </div>
    );
};

export default KPIEditPage;