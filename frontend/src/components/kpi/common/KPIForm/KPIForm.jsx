import React, { useState, useEffect, isValidElement } from 'react';
import PropTypes from 'prop-types';
import KPIFormFields from './KPIFormFields';
import KPIValidation from './KPIValidation';
import styles from './KPIForm.module.css';

const KPIForm = ({ 
    initialData, 
    onSubmit, 
    onCancel, 
    isLoading,
    frameworks,
    sectors,
    categories,
    users
}) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        kpiType: 'COUNT',
        calculationLogic: 'HIGHER_IS_BETTER',
        measureType: 'CUMULATIVE',
        unit: '',
        decimalPlaces: 2,
        targetMin: '',
        targetMax: '',
        frameworkId: '',
        sectorId: '',
        categoryId: '',
        ownerId: '',
        departmentId: '',
        strategicObjective: '',
        isActive: true,
        metadata: {},
        ...initialData
    });
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('basic');
    const [validationResult, setValidationResult] = useState(null);
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = 'KPI name is required';
        if (!formData.code?.trim()) newErrors.code = 'KPI code is required';
        if (!formData.kpiType) newErrors.kpiType = 'KPI type is required';
        if (!formData.calculationLogic) newErrors.calculationLogic = 'Calculation logic is required';
        if (!formData.frameworkId) newErrors.frameworkId = 'Framework is required';
        if (!formData.sectorId) newErrors.sectorId = 'Sector is required';
        if (!formData.ownerId) newErrors.ownerId = 'Owner is required';
        if (formData.targetMin && formData.targetMax && 
            parseFloat(formData.targetMin) > parseFloat(formData.targetMax)) {
            newErrors.targetMin = 'Min cannot be greater than max';
            newErrors.targetMax = 'Max cannot be less than min';
        }
        if (formData.kpiType === 'PERCENTAGE') {
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = {
                ...formData,
                targetMin: formData.targetMin ? parseFloat(formData.targetMin) : null,
                targetMax: formData.targetMax ? parseFloat(formData.targetMax) : null,
                decimalPlaces: parseInt(formData.decimalPlaces, 10),
            };
            onSubmit(submitData);
        }
    };
    const handleValidate = async () => {
        if (validateForm()) {
            setValidationResult({
                isValid: true,
                completenessErrors: [],
                weightValidation: { valid: true, message: 'Valid' },
                circularDependency: { valid: true, path: [] }
            });
        }
    };
    const tabs = [
        { id: 'basic', label: 'Basic Information' },
        { id: 'target', label: 'Target Settings' },
        { id: 'advanced', label: 'Advanced' },
        { id: 'validation', label: 'Validation' }
    ];
    return (
        <form onSubmit={handleSubmit} className={styles.kpiForm}>
            <div className={styles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.formContent}>
                {activeTab === 'basic' && (
                    <KPIFormFields
                        formData={formData}
                        onChange={handleChange}
                        errors={errors}
                        frameworks={frameworks}
                        sectors={sectors}
                        categories={categories}
                        users={users}
                    />
                )}

                {activeTab === 'target' && (
                    <div className={styles.targetSection}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Target Range (Optional)</label>
                            <div className={styles.rangeInputs}>
                                <input
                                    type="number"
                                    value={formData.targetMin}
                                    onChange={(e) => handleChange('targetMin', e.target.value)}
                                    placeholder="Min"
                                    className={`${styles.input} ${errors.targetMin ? styles.error : ''}`}
                                    step="any"
                                />
                                <span>to</span>
                                <input
                                    type="number"
                                    value={formData.targetMax}
                                    onChange={(e) => handleChange('targetMax', e.target.value)}
                                    placeholder="Max"
                                    className={`${styles.input} ${errors.targetMax ? styles.error : ''}`}
                                    step="any"
                                />
                            </div>
                            {errors.targetMin && <span className={styles.errorText}>{errors.targetMin}</span>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Unit of Measurement</label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => handleChange('unit', e.target.value)}
                                placeholder="e.g., KES, %, people, days"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Decimal Places</label>
                            <select
                                value={formData.decimalPlaces}
                                onChange={(e) => handleChange('decimalPlaces', e.target.value)}
                                className={styles.select}
                            >
                                <option value={0}>0</option>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                            </select>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Formula (JSON)</label>
                            <textarea
                                value={JSON.stringify(formData.formula, null, 2)}
                                onChange={(e) => {
                                    try {
                                        const formula = JSON.parse(e.target.value);
                                        handleChange('formula', formula);
                                    } catch {
                                        // Invalid JSON, ignore
                                    }
                                }}
                                placeholder='{"custom_formula": "actual / target * 100"}'
                                className={styles.textarea}
                                rows={4}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className={styles.advancedSection}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                    className={styles.checkbox}
                                />
                                Active
                            </label>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Strategic Objective</label>
                            <input
                                type="text"
                                value={formData.strategicObjective}
                                onChange={(e) => handleChange('strategicObjective', e.target.value)}
                                placeholder="e.g., Increase Market Share"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Metadata (JSON)</label>
                            <textarea
                                value={JSON.stringify(formData.metadata, null, 2)}
                                onChange={(e) => {
                                    try {
                                        const metadata = JSON.parse(e.target.value);
                                        handleChange('metadata', metadata);
                                    } catch {
                                        // Invalid JSON, ignore
                                    }
                                }}
                                placeholder='{"department": "Sales", "priority": "high"}'
                                className={styles.textarea}
                                rows={4}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'validation' && (
                    <KPIValidation
                        formData={formData}
                        validationResult={validationResult}
                        onValidate={handleValidate}
                    />
                )}
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    onClick={onCancel}
                    className={styles.cancelButton}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : (initialData ? 'Update KPI' : 'Create KPI')}
                </button>
            </div>
        </form>
    );
};
KPIForm.propTypes = {
    initialData: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    frameworks: PropTypes.array,
    sectors: PropTypes.array,
    categories: PropTypes.array,
    users: PropTypes.array,
};
KPIForm.defaultProps = {
    isLoading: false,
    frameworks: [],
    sectors: [],
    categories: [],
    users: [],
};
export default KPIForm;