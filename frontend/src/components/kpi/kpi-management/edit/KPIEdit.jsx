import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKPI, updateKPI, selectCurrentKPI, selectKPILoadingDetails } from '../../../../store/kpi';
import KPIEditBasic from './KPIEditBasic';
import KPIEditConfig from './KPIEditConfig';
import KPIEditAssignments from './KPIEditAssignments';
import KPIActivateDeactivate from './KPIActivateDeactivate';
import KPILoading from '../../common/KPILoading';

const KPIEdit = ({ kpiId, onSave, onCancel }) => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('basic');
    
    const kpi = useSelector(selectCurrentKPI);
    const loading = useSelector(selectKPILoadingDetails);
    
    useEffect(() => {
        if (kpiId) {
            dispatch(fetchKPI(kpiId));
        }
    }, [dispatch, kpiId]);
    
    const handleUpdate = async (data) => {
        await dispatch(updateKPI({ id: kpiId, data })).unwrap();
        onSave?.();
    };
    
    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'config', label: 'Configuration' },
        { id: 'assignments', label: 'Assignments' },
        { id: 'actions', label: 'Actions' }
    ];
    
    if (loading) {
        return <KPILoading text="Loading KPI data..." />;
    }
    
    return (
        <div className="kpi-edit-modal">
            <div className="kpi-edit-container">
                <div className="kpi-edit-header">
                    <h2>Edit KPI: {kpi?.name}</h2>
                    <button className="close-btn" onClick={onCancel}>×</button>
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
                        <KPIEditBasic kpi={kpi} onSave={handleUpdate} onCancel={onCancel} />
                    )}
                    {activeTab === 'config' && (
                        <KPIEditConfig kpi={kpi} onSave={handleUpdate} onCancel={onCancel} />
                    )}
                    {activeTab === 'assignments' && (
                        <KPIEditAssignments kpi={kpi} onSave={handleUpdate} onCancel={onCancel} />
                    )}
                    {activeTab === 'actions' && (
                        <KPIActivateDeactivate kpi={kpi} onComplete={onSave} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default KPIEdit;