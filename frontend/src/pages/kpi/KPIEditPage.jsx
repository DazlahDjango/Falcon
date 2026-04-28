import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KPIEdit } from '../../components/kpi/modules/KPIManagement';
import styles from './Pages.module.css';

const KPIEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const handleComplete = () => {
        navigate(`/kpi/detail/${id}`);
    };
    const handleCancel = () => {
        navigate(`/kpi/detail/${id}`);
    };
    const handleError = (error) => {
        console.error('KPI Edit Error:', error);
    };
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>Edit KPI</h1>
                <p className={styles.pageDescription}>
                    Update KPI properties, targets, and configuration.
                </p>
            </div>
            <KPIEdit
                kpiId={id}
                onComplete={handleComplete}
                onCancel={handleCancel}
                onError={handleError}
            />
        </div>
    );
};
export default KPIEditPage;