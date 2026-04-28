import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import KPIDetailHeader from './KPIDetailHeader';
import KPIDetailInfo from './KPIDetailInfo';
import KPIDetailScores from './KPIDetailScores';
import KPIDetailTargets from './KPIDetailTargets';
import KPIDetailActuals from './KPIDetailActuals';
import kpiService from '../../../../../services/kpi/kpi.service';
import styles from './KPIDetail.module.css';

const KPIDetail = ({ kpiId, onBack, onEdit, onManageWeights, onRefresh, onError }) => {
    const [kpi, setkpi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    useEffect(() => {
        if (kpiId) {
            fetchKPI();
        }
    }, [kpiId]);
    const fetchKPI = async () => {
        setLoading(true);
        try {
            const data = await kpiService.getKPI(kpiId);
            setkpi(data);
        } catch (error) {
            console.error('Failed to fetch KPI:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const handleActivate = async () => {
        try {
            await kpiService.activateKPI(kpiId);
            fetchKPI();
            if (onRefresh) onRefresh();
        } catch (error) {
            if (onError) onError(error);
        }
    };
    const handleDeactivate = async () => {
        try {
            await kpiService.deactivateKPI(kpiId);
            fetchKPI();
            if (onRefresh) onRefresh();
        } catch (error) {
            if (onError) onError(error);
        }
    };
    const tabs = [
        { id: 'info', label: 'Information' },
        { id: 'scores', label: 'Scores' },
        { id: 'targets', label: 'Targets' },
        { id: 'actuals', label: 'Actuals' }
    ];
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading KPI details...</p>
            </div>
        );
    }
    if (!kpi) {
        return (
            <div className={styles.errorContainer}>
                <p>KPI not found</p>
                <button onClick={onBack} className={styles.backButton}>Go Back</button>
            </div>
        );
    }
    return (
        <div className={styles.kpiDetail}>
            <KPIDetailHeader
                kpi={kpi}
                onBack={onBack}
                onEdit={onEdit}
                onManageWeights={onManageWeights}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
            />
            
            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'info' && <KPIDetailInfo kpi={kpi} />}
                {activeTab === 'scores' && <KPIDetailScores kpiId={kpiId} />}
                {activeTab === 'targets' && <KPIDetailTargets kpiId={kpiId} />}
                {activeTab === 'actuals' && <KPIDetailActuals kpiId={kpiId} />}
            </div>
        </div>
    );
};
KPIDetail.propTypes = {
    kpiId: PropTypes.string.isRequired,
    onBack: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onManageWeights: PropTypes.func.isRequired,
    onRefresh: PropTypes.func,
    onError: PropTypes.func,
};
export default KPIDetail;