import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ValidationQueueItem from './ValidationQueueItem';
import actualService from '../../../../../services/kpi/actual.service';
import validationService from '../../../../../services/kpi/validation.service';
import styles from './ValidationQueue.module.css';

const ValidationQueue = ({ userId, refreshTrigger, onRefresh, onError }) => {
    const [pendingValidations, setPendingValidations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    useEffect(() => {
        fetchPendingValidations();
    }, [userId, refreshTrigger]);
    const fetchPendingValidations = async () => {
        setLoading(true);
        try {
            const response = await validationService.getPendingValidations(userId);
            setPendingValidations(response.results || []);
        } catch (error) {
            console.error('Failed to fetch pending validations:', error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };
    const handleApprove = async (id, comment) => {
        setProcessingId(id);
        try {
            await validationService.approveValidation(id, comment);
            onRefresh();
        } catch (error) {
            console.error('Failed to approve:', error);
            if (onError) onError(error);
        } finally {
            setProcessingId(null);
        }
    };
    const handleReject = async (id, reasonId, comment) => {
        setProcessingId(id);
        try {
            await validationService.rejectValidation(id, reasonId, comment);
            onRefresh();
        } catch (error) {
            console.error('Failed to reject:', error);
            if (onError) onError(error);
        } finally {
            setProcessingId(null);
        }
    };
    const handleEscalate = async (id, reason) => {
        setProcessingId(id);
        try {
            await validationService.escalateValidation(id, reason);
            onRefresh();
        } catch (error) {
            console.error('Failed to escalate:', error);
            if (onError) onError(error);
        } finally {
            setProcessingId(null);
        }
    };
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading pending validations...</p>
            </div>
        );
    }
    if (pendingValidations.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>✓</div>
                <p>No pending validations</p>
                <p className={styles.emptyHint}>All team members have submitted validated data.</p>
            </div>
        );
    }
    const stats = {
        total: pendingValidations.length,
        pendingOver3Days: pendingValidations.filter(v => {
            const daysPending = (new Date() - new Date(v.submitted_at)) / (1000 * 60 * 60 * 24);
            return daysPending > 3;
        }).length
    };
    return (
        <div className={styles.validationQueue}>
            <div className={styles.header}>
                <h3>Pending Validations</h3>
                <div className={styles.stats}>
                    <span className={styles.totalCount}>{stats.total} pending</span>
                    {stats.pendingOver3Days > 0 && (
                        <span className={styles.overdueWarning}>
                            ⚠️ {stats.pendingOver3Days} overdue
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.queueList}>
                {pendingValidations.map(validation => (
                    <ValidationQueueItem
                        key={validation.id}
                        validation={validation}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onEscalate={handleEscalate}
                        isProcessing={processingId === validation.id}
                    />
                ))}
            </div>
        </div>
    );
};
ValidationQueue.propTypes = {
    userId: PropTypes.string.isRequired,
    refreshTrigger: PropTypes.number,
    onRefresh: PropTypes.func.isRequired,
    onError: PropTypes.func,
};
export default ValidationQueue;