import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiRefreshCw, FiUsers, FiBriefcase } from 'react-icons/fi';
import { fetchReferenceData, selectReferenceData, selectSettingsLoading } from '../../../store/kpi';
import ReferenceDataTable from './ReferenceDataTable';
import KPILoading from '../common/KPILoading';

const ReferenceData = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('users');
    
    const referenceData = useSelector(selectReferenceData);
    const loading = useSelector(selectSettingsLoading);
    
    useEffect(() => {
        dispatch(fetchReferenceData(['users', 'departments']));
    }, [dispatch]);
    
    const tabs = [
        { id: 'users', label: 'Users', icon: <FiUsers size={14} /> },
        { id: 'departments', label: 'Departments', icon: <FiBriefcase size={14} /> }
    ];
    
    if (loading) {
        return <KPILoading text="Loading reference data..." />;
    }
    
    return (
        <div className="kpi-settings-container">
            <div className="settings-header">
                <h2>Reference Data</h2>
                <p>View and manage reference data used across the KPI system</p>
            </div>
            
            <div className="reference-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`reference-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
                <button 
                    className="refresh-ref-btn"
                    onClick={() => dispatch(fetchReferenceData(['users', 'departments']))}
                >
                    <FiRefreshCw size={14} />
                    Refresh
                </button>
            </div>
            
            <div className="reference-content">
                {activeTab === 'users' && (
                    <ReferenceDataTable 
                        data={referenceData?.users || []}
                        type="users"
                        columns={['full_name', 'email', 'role', 'department']}
                    />
                )}
                {activeTab === 'departments' && (
                    <ReferenceDataTable 
                        data={referenceData?.departments || []}
                        type="departments"
                        columns={['name', 'code', 'parent_name']}
                    />
                )}
            </div>
        </div>
    );
};

export default ReferenceData;