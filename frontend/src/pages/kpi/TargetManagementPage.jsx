import React from 'react';
import TargetManagement from '../../components/kpi/modules/TargetManagement';
import styles from './Pages.module.css';

const TargetManagementPage = () => {
    const handleTargetChange = (targetId) => {
        console.log('Selected target:', targetId);
    };
    const handleError = (error) => {
        console.error('Target Management Error:', error);
    };
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>Target Management</h1>
                <p className={styles.pageDescription}>
                    Set annual targets, configure monthly phasing, and cascade targets across your organization.
                </p>
            </div>
            <TargetManagement
                initialView="list"
                onTargetChange={handleTargetChange}
                onError={handleError}
            />
        </div>
    );
};
export default TargetManagementPage;