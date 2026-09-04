import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKPI, updateKPI, selectCurrentKPI, selectKPILoadingDetails } from '../../../store/kpi';
import { KPIEditBasic, KPIEditConfig, KPIEditAssignments, KPIActivateDeactivate } from '../../../components/kpi';
import KPILoading from '../../../components/kpi/common/KPILoading';
import { useKPIPermissions } from '../../../hooks/kpi';
import { KpiPaths } from '../../../routes/kpi.routes';

const KPIEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, canManageKPIs } = useKPIPermissions();
    const [activeTab, setActiveTab] = useState('basic');

    const kpi = useSelector(selectCurrentKPI);
    const loading = useSelector(selectKPILoadingDetails);

    useEffect(() => {
        if (id) {
            dispatch(fetchKPI(id));
        }
    }, [dispatch, id]);

    const isOwnerOrCreator = kpi && user && (
        String(kpi.owner_id) === String(user.id) ||
        String(kpi.created_by_id) === String(user.id) ||
        String(kpi.owner) === String(user.id) ||
        (kpi.owner_email && user.email && kpi.owner_email.toLowerCase() === user.email.toLowerCase()) ||
        (kpi.user_email && user.email && kpi.user_email.toLowerCase() === user.email.toLowerCase())
    );
    const isPendingOrInactive = kpi && (kpi.approval_status === 'PENDING_APPROVAL' || kpi.approval_status === 'PENDING' || !kpi.is_active);
    const canEditThisKPI = canManageKPIs || (isOwnerOrCreator && isPendingOrInactive);

    const handleUpdate = async (data) => {
        await dispatch(updateKPI({ id, data })).unwrap();
        navigate(KpiPaths.KPIDetail(id));
    };

    const handleBack = () => {
        navigate(KpiPaths.KPIDetail(id));
    };

    if (loading || !kpi) {
        return <KPILoading text="Loading Performance Indicator data..." />;
    }

    if (!canEditThisKPI) {
        navigate(KpiPaths.KPIDetail(id));
        return null;
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