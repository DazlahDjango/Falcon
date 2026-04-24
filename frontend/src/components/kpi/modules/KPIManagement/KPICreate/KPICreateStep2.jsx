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
                newErrors.targetMin = 'Percentage target cannot exceed 100';
            }
            if (formData.targetMax && parseFloat(formData.targetMax) > 100) {
                newErrors.targetMax = 'Percentage target cannot exceed 100';
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
            <h3>Target Settings</h3>
            
            <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                    <label>Target Range (Optional)</label>
                    <div className={styles.rangeInputs}>
                        <input
                            type="number"
                            value={formData.targetMin}
                            onChange={(e) => handleChange('targetMin', e.target.value)}
                            placeholder="Min"
                            className={errors.targetMin ? styles.error : ''}
                            step="any"
                        />
                        <span>to</span>
                        <input
                            type="number"
                            value={formData.targetMax}
                            onChange={(e) => handleChange('targetMax', e.target.value)}
                            placeholder="Max"
                            className={errors.targetMax ? styles.error : ''}
                            step="any"
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
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                    </select>
                    <small>Number of decimal places for display</small>
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

                <div className={styles.fieldGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => handleChange('isActive', e.target.checked)}
                        />
                        Active immediately after creation
                    </label>
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
                <button onClick={onBack} className={styles.backButton}>← Back</button>
                <button onClick={handleSubmit} className={styles.nextButton}>Next →</button>
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