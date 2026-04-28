import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KPIDetail } from '../../components/kpi/modules/KPIManagement';
import styles from './Pages.module.css';

const KPIDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const handleBack = () => {
        navigate('/kpi/management');
    };
    const handleEdit = () => {
        navigate(`/kpi/edit/${id}`);
    };
    const handleManageWeights = () => {
        navigate(`/kpi/weights/${id}`);
    };
    const handleError = (error) => {
        console.error('KPI Detail Error:', error);
    };
    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <button onClick={handleBack} className={styles.backButton}>
                    ← Back to KPIs
                </button>
            </div>
            <KPIDetail
                kpiId={id}
                onBack={handleBack}
                onEdit={handleEdit}
                onManageWeights={handleManageWeights}
                onError={handleError}
            />
        </div>
    );
};
export default KPIDetailPage;