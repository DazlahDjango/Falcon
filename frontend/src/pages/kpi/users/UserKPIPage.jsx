import React from 'react';
import { useParams } from 'react-router-dom';
import { UserProfileKPISection } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const UserKPIPage = () => {
    const { userId } = useParams();
    const { isAuthenticated, isManager, isSuperAdmin, isClientAdmin, isExecutive } = useKPIPermissions();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Allow if viewing own profile or has manager permissions
    const canView = isAuthenticated && (
        userId === currentUser.id ||
        isManager ||
        isSuperAdmin ||
        isClientAdmin ||
        isExecutive
    );
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!canView) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <UserProfileKPISection userId={userId} />
        </div>
    );
};

export default UserKPIPage;