import React from 'react';
import { ChampionDashboard } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const ChampionDashboardPage = () => {
    const { isAuthenticated, isDashboardChampion, isSuperAdmin, isClientAdmin } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!isDashboardChampion && !isSuperAdmin && !isClientAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <ChampionDashboard />
        </div>
    );
};

export default ChampionDashboardPage;