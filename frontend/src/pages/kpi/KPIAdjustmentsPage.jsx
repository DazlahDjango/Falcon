import React from 'react';
import { useAuth } from '../../hooks/accounts/useAuth';
import AdjustmentRequests from '../../components/kpi/modules/PerformanceTracking/AdjustmentRequests';
import styles from './Pages.module.css';

const KPIAdjustmentsPage = () => {
    const { user, hasRole } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);
    const userRole = hasRole('MANAGER') ? 'manager' : hasRole('ADMIN') ? 'admin' : 'employee';
    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    const handleError = (error) => {
        console.error('Adjustments Error:', error);
    };
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>Adjustment Requests</h1>
                <p className={styles.pageDescription}>
                    Request adjustments to approved data or review pending requests from your team.
                </p>
            </div>
            <AdjustmentRequests
                userId={user?.id}
                userRole={userRole}
                refreshTrigger={refreshTrigger}
                onRefresh={handleRefresh}
                onError={handleError}
            />
        </div>
    );
};
export default KPIAdjustmentsPage;