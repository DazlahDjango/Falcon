import React from 'react';
import { ReferenceData } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const ReferenceDataPage = () => {
    const { isAuthenticated, isSuperAdmin, isClientAdmin, isDashboardChampion } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!isSuperAdmin && !isClientAdmin && !isDashboardChampion) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <ReferenceData />
        </div>
    );
};

export default ReferenceDataPage;