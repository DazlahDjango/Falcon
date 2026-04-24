import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import KPIWeightForm from './KPIWeightForm';
import { kpiService } from '../../../../../services/kpi/kpi.service';
import styles from './KPIWeight.module.css';

const KPIWeight = ({ kpiId, onComplete, onCancel, onError }) => {
    const [kpi, setKpi] = useState(null);
    const [weights, setWeights] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        fetchData();
    }, [kpiId]);
    const fetchData = async () => {
        try {
            const [kpiData, weightsData] = await Promise.all([
                kpiService.getKPI(kpiId),
                kpiService.getKPIWeights(kpiId)
            ]);
            setKpi(kpiData);
            setWeights(weightsData);
            // Fetch users for the tenant
            // This would come from accounts service
            setUsers([
                { id: '1', name: 'John Doe', email: 'john@example.com' },
                { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
                { id: '3', name: 'Bob Johnson', email: 'bob@example.com' }
            ]);
        } catch (error) {
            console.error('Failed to fetch weight data:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (updatedWeights) => {
        setSubmitting(true);
        try {
            await kpiService.updateKPIWeights(kpiId, updatedWeights);
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Failed to update weights:', error);
            if (onError) onError(error);
        } finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading weight configuration...</p>
            </div>
        );
    }
    return (
        <div className={styles.kpiWeight}>
            <div className={styles.header}>
                <h2>Manage KPI Weights</h2>
                <p>{kpi?.name} ({kpi?.code})</p>
                <p className={styles.note}>
                    Weights determine how much this KPI contributes to overall performance score.
                    Total must sum to 100%.
                </p>
            </div>
            
            <KPIWeightForm
                kpi={kpi}
                weights={weights}
                users={users}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                isLoading={submitting}
            />
        </div>
    );
};
KPIWeight.propTypes = {
    kpiId: PropTypes.string.isRequired,
    onComplete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onError: PropTypes.func,
};
export default KPIWeight;