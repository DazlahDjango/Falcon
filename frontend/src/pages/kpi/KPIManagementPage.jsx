import React from "react";
import KPIManagement from '../../components/kpi/modules/KPIManagement';
import styles from './Pages.module.css';

const KPIManagementPage = () => {
    const handleKPIChange = (kpiId) => {
        console.log('Selected KPI:', kpiId);
    };
    const handleError = (error) => {
        console.error('KPI Management Error:', error);
    };
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>KPI Management</h1>
                <p className={styles.pageDescription}>
                    Create, edit, and manage your organization's KPIs. Define targets, set weights, and track performance.
                </p>
            </div>
            <KPIManagement
                initialView="list"
                onKpiChange={handleKPIChange}
                onError={handleError}
            />
        </div>
    );
};
export default KPIManagementPage;
