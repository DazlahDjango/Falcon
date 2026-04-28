import React from 'react';
import { useAuth } from '../../hooks/accounts/useAuth';
import ValidationQueue from '../../components/kpi/modules/PerformanceTracking/ValidationQueue';
import styles from './Pages.module.css';

const KPIValidationQueuePage = () => {
    const { user } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleError = (error) => {
        console.error('Validation Queue Error:', error);
    };
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>Validation Queue</h1>
                <p className={styles.pageDescription}>
                    Review and validate team member submissions. Approve, reject, or escalate as needed.
                </p>
            </div>
            <ValidationQueue
                userId={user?.id}
                refreshTrigger={refreshTrigger}
                onRefresh={handleRefresh}
                onError={handleError}
            />
        </div>
    );
};
export default KPIValidationQueuePage;