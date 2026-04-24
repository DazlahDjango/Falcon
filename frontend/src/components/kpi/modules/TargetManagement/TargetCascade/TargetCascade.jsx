import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CascadeWizard from './CascadeWizard';
import CascadeTree from './CascadeTree';
import { targetService } from '../../../../../services/kpi/target.service';
import styles from './TargetCascade.module.css';

const TargetCascade = ({ targetId, onComplete, onCancel, onError }) => {
    const [target, setTarget] = useState(null);
    const [cascadeMaps, setCascadeMaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        fetchTargetAndCascade();
    }, [targetId]);
    const fetchTargetAndCascade = async () => {
        try {
            const [targetData, cascadeData] = await Promise.all([
                targetService.getTarget(targetId),
                targetService.getCascadeMaps(targetId)
            ]);
            setTarget(targetData);
            setCascadeMaps(cascadeData);
        } catch (error) {
            console.error('Failed to fetch cascade data:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const handleCascadeComplete = async (cascadeData) => {
        setSubmitting(true);
        try {
            await targetService.createCascade(targetId, cascadeData);
            fetchTargetAndCascade();
        } catch (error) {
            console.error('Failed to save cascade:', error);
            if (onError) onError(error);
        } finally {
            setSubmitting(false);
        }
    };
    const handleRollback = async (cascadeId) => {
        setSubmitting(true);
        try {
            await targetService.rollbackCascade(cascadeId);
            fetchTargetAndCascade();
        } catch (error) {
            console.error('Failed to rollback cascade:', error);
            if (onError) onError(error);
        } finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading cascade data...</p>
            </div>
        );
    }
    if (!target) {
        return (
            <div className={styles.errorContainer}>
                <p>Target not found</p>
                <button onClick={onCancel} className={styles.backButton}>Go Back</button>
            </div>
        );
    }
    const hasCascade = cascadeMaps && cascadeMaps.length > 0;
    return (
        <div className={styles.targetCascade}>
            <div className={styles.header}>
                <h2>Target Cascade</h2>
                <div className={styles.targetInfo}>
                    <span className={styles.kpiName}>{target.kpi_name}</span>
                    <span className={styles.targetValue}>Annual Target: {target.target_value} {target.unit}</span>
                </div>
            </div>

            {hasCascade ? (
                <div className={styles.existingCascade}>
                    <h3>Existing Cascade Structure</h3>
                    <CascadeTree 
                        cascadeMaps={cascadeMaps} 
                        target={target}
                        onRollback={handleRollback}
                    />
                    <div className={styles.actions}>
                        <button onClick={onCancel} className={styles.cancelButton}>
                            Back
                        </button>
                        <button onClick={onComplete} className={styles.doneButton}>
                            Done
                        </button>
                    </div>
                </div>
            ) : (
                <CascadeWizard
                    target={target}
                    onSubmit={handleCascadeComplete}
                    onCancel={onCancel}
                    isLoading={submitting}
                />
            )}
        </div>
    );
};
TargetCascade.propTypes = {
    targetId: PropTypes.string.isRequired,
    onComplete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onError: PropTypes.func,
};
export default TargetCascade;