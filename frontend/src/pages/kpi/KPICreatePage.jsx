import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICreate } from '../../components/kpi/modules/KPIManagement';
import styles from './Pages.module.css';

const KPICreatePage = () => {
    const navigate = useNavigate();
    const handleComplete = (newKpi) => {
        navigate(`/kpi/detail/${newKpi.id}`);
    };
    const handleCancel = () => {
        navigate('/kpi/management');
    };
    const handleError = (error) => {
        console.error('KPI Create Error:', error);
    };
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>Create New KPI</h1>
                <p className={styles.pageDescription}>
                    Define a new Key Performance Indicator with its properties, targets, and calculation logic.
                </p>
            </div>
            <KPICreate
                onComplete={handleComplete}
                onCancel={handleCancel}
                onError={handleError}
            />
        </div>
    );
};
export default KPICreatePage;