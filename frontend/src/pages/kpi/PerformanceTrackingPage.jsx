import React from 'react';
import { useAuth } from '../../hooks/accounts/useAuth';
import { usePermissionContext } from '../../contexts/accounts/PermissionContext';
import PerformanceTracking from '../../components/kpi/modules/PerformanceTracking';
import styles from './Pages.module.css';

const PerformanceTrackingPage = () => {
    const { user, hasRole } = useAuth();
    const userRole = hasRole('MANAGER') ? 'manager' : hasRole('ADMIN') ? 'admin' : 'employee';
    const handleError = (error) => {
        console.error('Performance Tracking Error:', error);
    };
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>Performance Tracking</h1>
                <p className={styles.pageDescription}>
                    Enter your monthly performance data, review submissions, and manage adjustment requests.
                </p>
            </div>
            <PerformanceTracking
                userId={user?.id}
                userRole={userRole}
                onError={handleError}
            />
        </div>
    );
};
export default PerformanceTrackingPage;