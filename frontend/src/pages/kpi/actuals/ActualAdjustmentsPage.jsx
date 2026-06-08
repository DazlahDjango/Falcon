import React from 'react';
import { ActualAdjustmentList } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const ActualAdjustmentsPage = () => {
    const { isAuthenticated, canManageKPIs } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <div className="page-header">
                <h1>Actual Adjustments</h1>
                <p>Review and approve adjustment requests</p>
            </div>
            
            <ActualAdjustmentList canApprove={canManageKPIs} />
        </div>
    );
};

export default ActualAdjustmentsPage;