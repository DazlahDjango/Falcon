import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { KPIForm } from '../../../common';
import { kpiService } from '../../../../../services/kpi/kpi.service';
import styles from './KPIEdit.module.css';

const KPIEdit = ({ kpiId, onComplete, onCancel, onError }) => {
    const [kpi, setKpi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        fetchKPI();
    }, [kpiId]);
    const fetchKPI = async () => {
        try {
            const data = await kpiService.getKPI(kpiId);
            setKpi(data);
        } catch (error) {
            console.error('Failed to fetch KPI:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            await kpiService.updateKPI(kpiId, formData);
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Failed to update KPI:', error);
            if (onError) onError(error);
        } finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading KPI data...</p>
            </div>
        );
    }
    if (!kpi) {
        return (
            <div className={styles.errorContainer}>
                <p>KPI not found</p>
                <button onClick={onCancel} className={styles.backButton}>Go Back</button>
            </div>
        );
    }
    return (
        <div className={styles.kpiEdit}>
            <div className={styles.header}>
                <h2>Edit KPI</h2>
                <p>{kpi.name} ({kpi.code})</p>
            </div>
            <KPIForm
                initialData={kpi}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                isLoading={submitting}
            />
        </div>
    );
};
KPIEdit.propTypes = {
    kpiId: PropTypes.string.isRequired,
    onComplete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onError: PropTypes.func,
};
export default KPIEdit;