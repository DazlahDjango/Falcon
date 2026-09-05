import React from 'react';
import { BulkUpload } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const BulkUploadPage = () => {
    const { isAuthenticated, canBulkUpload, isSuperAdmin, isClientAdmin, isDashboardChampion } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!canBulkUpload) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <BulkUpload />
        </div>
    );
};

export default BulkUploadPage;