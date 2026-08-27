import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RedAlertsList } from '../../../components/kpi';
import { fetchRedAlerts, selectRedAlerts, selectScoreLoading } from '../../../store/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';
import KPILoading from '../../../components/kpi/common/KPILoading';

const RedAlertsPage = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, isManager, isExecutive, isSuperAdmin, isClientAdmin } = useKPIPermissions();
    const canView = isManager || isExecutive || isSuperAdmin || isClientAdmin;
    
    const alerts = useSelector(selectRedAlerts);
    const loading = useSelector(selectScoreLoading);
    
    useEffect(() => {
        dispatch(fetchRedAlerts());
    }, [dispatch]);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!canView) {
        return <Navigate to="/dashboard" replace />;
    }
    
    if (loading && alerts.length === 0) {
        return <KPILoading text="Loading red alerts..." />;
    }
    
    return (
        <div className="kpi-page-container">
            <div className="page-header">
                <h1>Red Alerts</h1>
                <p>KPIs that are off track and require attention</p>
            </div>
            
            <RedAlertsList alerts={alerts} loading={loading} />
        </div>
    );
};

export default RedAlertsPage;