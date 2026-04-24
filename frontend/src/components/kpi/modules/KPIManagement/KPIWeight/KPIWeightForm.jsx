import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './KPIWeight.module.css';

const KPIWeightForm = ({ kpi, weights, users, onSubmit, onCancel, isLoading }) => {
    const [weightValues, setWeightValues] = useState(() => {
        const initial = {};
        users.forEach(user => {
            const existing = weights.find(w => w.user_id === user.id);
            initial[user.id] = existing ? existing.weight : 0;
        });
        return initial;
    });
    const [errors, setErrors] = useState({});
    const handleWeightChange = (userId, value) => {
        const numValue = parseFloat(value) || 0;
        setWeightValues(prev => ({ ...prev, [userId]: numValue }));
        // Clear error for this user if weight is valid
        if (errors[userId]) {
            setErrors(prev => ({ ...prev, [userId]: undefined }));
        }
    };
    const validate = () => {
        const newErrors = {};
        let total = 0;
        users.forEach(user => {
            const weight = weightValues[user.id] || 0;
            total += weight;
            if (weight < 0) {
                newErrors[user.id] = 'Weight cannot be negative';
            } else if (weight > 100) {
                newErrors[user.id] = 'Weight cannot exceed 100';
            }
        });
        if (Math.abs(total - 100) > 0.01) {
            newErrors.total = `Total weight must be 100%. Current total: ${total.toFixed(1)}%`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = () => {
        if (validate()) {
            const updatedWeights = users.map(user => ({
                user_id: user.id,
                weight: weightValues[user.id] || 0
            }));
            onSubmit(updatedWeights);
        }
    };
    const currentTotal = Object.values(weightValues).reduce((sum, w) => sum + w, 0);
    return (
        <div className={styles.formContainer}>
            <div className={styles.weightsTable}>
                <div className={styles.tableHeader}>
                    <div>User</div>
                    <div>Weight (%)</div>
                    <div>Status</div>
                </div>
                {users.map(user => (
                    <div key={user.id} className={styles.tableRow}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.name}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                        </div>
                        <div className={styles.weightInput}>
                            <input
                                type="number"
                                value={weightValues[user.id] || ''}
                                onChange={(e) => handleWeightChange(user.id, e.target.value)}
                                step="0.1"
                                min="0"
                                max="100"
                                className={errors[user.id] ? styles.error : ''}
                                disabled={isLoading}
                            />
                            <span className={styles.percent}>%</span>
                        </div>
                        <div>
                            {weightValues[user.id] > 0 ? (
                                <span className={styles.assignedBadge}>Assigned</span>
                            ) : (
                                <span className={styles.unassignedBadge}>Not Assigned</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.summary}>
                <div className={`${styles.totalWeight} ${Math.abs(currentTotal - 100) <= 0.01 ? styles.validTotal : styles.invalidTotal}`}>
                    Total Weight: {currentTotal.toFixed(1)}%
                </div>
                {errors.total && <div className={styles.errorText}>{errors.total}</div>}
            </div>
            <div className={styles.actions}>
                <button onClick={onCancel} className={styles.cancelButton} disabled={isLoading}>
                    Cancel
                </button>
                <button onClick={handleSubmit} className={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Weights'}
                </button>
            </div>
        </div>
    );
};
KPIWeightForm.propTypes = {
    kpi: PropTypes.object,
    weights: PropTypes.array,
    users: PropTypes.array,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};
export default KPIWeightForm;