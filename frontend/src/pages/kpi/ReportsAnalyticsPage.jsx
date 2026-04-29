import React from 'react';
import ReportsAnalytics from '../../components/kpi/modules/ReportsAnalytics';
import styles from './Pages.module.css';

const ReportsAnalyticsPage = () => {
    const handleError = (error) => {
        console.error('Reports Analytics Error:', error);
    };
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>Reports & Analytics</h1>
                <p className={styles.pageDescription}>
                    Generate comprehensive reports and analyze performance trends across your organization.
                </p>
            </div>
            <ReportsAnalytics onError={handleError} />
        </div>
    );
};
export default ReportsAnalyticsPage;