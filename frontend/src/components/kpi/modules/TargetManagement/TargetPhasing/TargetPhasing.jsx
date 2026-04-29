import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PhasingWizard from './PhasingWizard';
import PhasingChart from './PhasingChart';
import targetService from '../../../../../services/kpi/target.service';
import styles from './TargetPhasing.module.css';

const TargetPhasing = ({ targetId, onComplete, onCancel, onError }) => {
    const [target, setTarget] = useState(null);
    const [phasing, setPhasing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    useEffect(() => {
        fetchTargetPhasing();
    }, [targetId]);
    const fetchTargetPhasing = async () => {
        try {
            const [targetData, phasingData] = await Promise.all([
                targetService.getTarget(targetId),
                targetService.getPhasing(targetId)
            ]);
            setTarget(targetData);
            setPhasing(phasingData);
            if (phasingData.length > 0) {
                setIsLocked(phasingData.some(p => p.is_locked));
            }
        } catch (error) {
            console.error('Failed to fetch target data:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const handlePhasingComplete = async (phasingData) => {
        setSubmitting(true);
        try {
            await targetService.createPhasing(targetId, phasingData);
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Failed to save phasing:', error);
            if (onError) onError(error);
        } finally {
            setSubmitting(false);
        }
    };
    const handleLockPhasing = async () => {
        setSubmitting(true);
        try {
            await targetService.lockPhasing(targetId);
            setIsLocked(true);
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Failed to lock phasing:', error);
            if (onError) onError(error);
        } finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading target data...</p>
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
    return (
        <div className={styles.targetPhasing}>
            <div className={styles.header}>
                <h2>Monthly Target Phasing</h2>
                <div className={styles.targetInfo}>
                    <span className={styles.kpiName}>{target.kpi_name}</span>
                    <span className={styles.targetValue}>Annual Target: {target.target_value} {target.unit}</span>
                </div>
                {isLocked && (
                    <div className={styles.lockedWarning}>
                        ⚠️ Phasing is locked and cannot be modified
                    </div>
                )}
            </div>

            {phasing.length > 0 ? (
                <div className={styles.existingPhasing}>
                    <h3>Existing Monthly Distribution</h3>
                    <PhasingChart phasing={phasing} targetValue={target.target_value} />
                    {!isLocked && (
                        <div className={styles.actions}>
                            <button onClick={onCancel} className={styles.cancelButton}>
                                Back
                            </button>
                            <button onClick={handleLockPhasing} className={styles.lockButton} disabled={submitting}>
                                {submitting ? 'Locking...' : 'Lock Phasing'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <PhasingWizard
                    target={target}
                    onSubmit={handlePhasingComplete}
                    onCancel={onCancel}
                    isLoading={submitting}
                />
            )}
        </div>
    );
};
TargetPhasing.propTypes = {
    targetId: PropTypes.string.isRequired,
    onComplete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onError: PropTypes.func,
};
export default TargetPhasing;