import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './KPICreate.module.css';

const KPICreateStep2 = ({ data, onNext, onBack, onCancel }) => {
    const [formData, setFormData] = useState({
        targetMin: data.targetMin || '',
        targetMax: data.targetMax || '',
        decimalPlaces: data.decimalPlaces || 2,
        strategicObjective: data.strategicObjective || '',
        isActive: data.isActive !== undefined ? data.isActive : true
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (formData.targetMin && formData.targetMax &&
            parseFloat(formData.targetMin) > parseFloat(formData.targetMax)) {
            newErrors.targetMin = 'Min cannot be greater than max';
            newErrors.targetMax = 'Max cannot be less than min';
        }
        if (data.kpiType === 'PERCENTAGE') {
            if (formData.targetMin && parseFloat(formData.targetMin) > 100) {
                newErrors.targetMin = 'Max 100%';
            }
            if (formData.targetMax && parseFloat(formData.targetMax) > 100) {
                newErrors.targetMax = 'Max 100%';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onNext(formData);
        }
    };

    return (
        <div className={styles.step}>
            <div className={styles.stepHeader}>
                <h3>Target Settings</h3>
                <p>Configure the boundaries and display precision for this KPI.</p>
            </div>

            <div className={styles.formGrid}>
                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <label>Target Range (Optional)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                            type="number"
                            value={formData.targetMin}
                            onChange={(e) => handleChange('targetMin', e.target.value)}
                            placeholder="Minimum Value"
                            className={errors.targetMin ? styles.error : ''}
                            step="any"
                            style={{ flex: 1 }}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>to</span>
                        <input
                            type="number"
                            value={formData.targetMax}
                            onChange={(e) => handleChange('targetMax', e.target.value)}
                            placeholder="Maximum Value"
                            className={errors.targetMax ? styles.error : ''}
                            step="any"
                            style={{ flex: 1 }}
                        />
                    </div>
                    {errors.targetMin && <span className={styles.errorText}>{errors.targetMin}</span>}
                    {errors.targetMax && <span className={styles.errorText}>{errors.targetMax}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label>Decimal Places</label>
                    <select
                        value={formData.decimalPlaces}
                        onChange={(e) => handleChange('decimalPlaces', parseInt(e.target.value))}
                    >
                        {[0, 1, 2, 3, 4].map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <small className={styles.helperText}>Number of decimal places for display</small>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Strategic Objective</label>
                    <input
                        type="text"
                        value={formData.strategicObjective}
                        onChange={(e) => handleChange('strategicObjective', e.target.value)}
                        placeholder="e.g., Increase Market Share"
                    />
                </div>

                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => handleChange('isActive', e.target.checked)}
                            style={{ width: '1.25rem', height: '1.25rem', margin: 0, cursor: 'pointer' }}
                        />
                        <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>
                            Activate immediately after creation
                        </label>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
                <button onClick={onBack} className={styles.backButton}>← Back</button>
                <button onClick={handleSubmit} className={styles.nextButton}>
                    Next Step <span>→</span>
                </button>
            </div>
        </div>
    );
};

KPICreateStep2.propTypes = {
    data: PropTypes.object,
    onNext: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default KPICreateStep2;
