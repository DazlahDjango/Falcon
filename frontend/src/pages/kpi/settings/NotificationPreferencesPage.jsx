import React from 'react';
import { NotificationPreferences } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const NotificationPreferencesPage = () => {
    const { isAuthenticated } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <NotificationPreferences />
        </div>
    );
};

export default NotificationPreferencesPage;