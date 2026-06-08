import React from 'react';
import { IndividualDashboard } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const IndividualDashboardPage = () => {
    const { isAuthenticated } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <IndividualDashboard />
        </div>
    );
};

export default IndividualDashboardPage;