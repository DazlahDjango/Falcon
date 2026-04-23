import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './KPICreate.module.css';

const KPICreateStep1 = ({ data, onNext, onCancel }) => {
    const [formData, setFormData] = useState({
        name: data.name || '',
        code: data.code || '',
        description: data.description || '',
        kpiType: data.kpiType || 'COUNT',
        calculationLogic: data.calculationLogic || 'HIGHER_IS_BETTER',
        measureType: data.measureType || 'CUMULATIVE',
        unit: data.unit || '',
        frameworkId: data.frameworkId || '',
        sectorId: data.sectorId || '',
        categoryId: data.categoryId || '',
        ownerId: data.ownerId || '',
        departmentId: data.departmentId || '',
    });
    const [errors, setErrors] = useState({});
    const kpiTypes = [
        { value: 'COUNT', label: 'Count / Number' },
        { value: 'PERCENTAGE', label: 'Percentage (%)' },
        { value: 'FINANCIAL', label: 'Financial Amount' },
        { value: 'MILESTONE', label: 'Yes / No Milestone' },
        { value: 'TIME', label: 'Time / Turnaround' },
        { value: 'IMPACT', label: 'Impact Score' }
    ];
    const calculationLogics = [
        { value: 'HIGHER_IS_BETTER', label: 'Higher is Better', formula: '(Actual ÷ Target) × 100' },
        { value: 'LOWER_IS_BETTER', label: 'Lower is Better', formula: '(Target ÷ Actual) × 100' }
    ];
    const measureTypes = [
        { value: 'CUMULATIVE', label: 'Cumulative (YTD)', desc: 'Values add up over time' },
        { value: 'NON_CUMULATIVE', label: 'Non-Cumulative', desc: 'Period-only values' }
    ];
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'KPI name is required';
        if (!formData.code.trim()) newErrors.code = 'KPI code is required';
        if (!formData.frameworkId) newErrors.frameworkId = 'Framework is required';
        if (!formData.sectorId) newErrors.sectorId = 'Sector is required';
        if (!formData.ownerId) newErrors.ownerId = 'Owner is required';
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
            <h3>Basic Information</h3>
            
            <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                    <label>KPI Name <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Revenue Growth"
                        className={errors.name ? styles.error : ''}
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label>KPI Code <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                        placeholder="e.g., REV_001"
                        className={errors.code ? styles.error : ''}
                    />
                    {errors.code && <span className={styles.errorText}>{errors.code}</span>}
                    <small>Use uppercase letters, numbers, underscores, and hyphens</small>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={3}
                        placeholder="Describe what this KPI measures..."
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label>KPI Type <span className={styles.required}>*</span></label>
                    <select
                        value={formData.kpiType}
                        onChange={(e) => handleChange('kpiType', e.target.value)}
                    >
                        {kpiTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Calculation Logic <span className={styles.required}>*</span></label>
                    <select
                        value={formData.calculationLogic}
                        onChange={(e) => handleChange('calculationLogic', e.target.value)}
                    >
                        {calculationLogics.map(logic => (
                            <option key={logic.value} value={logic.value}>
                                {logic.label} ({logic.formula})
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Measure Type</label>
                    <select
                        value={formData.measureType}
                        onChange={(e) => handleChange('measureType', e.target.value)}
                    >
                        {measureTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label} - {type.desc}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Unit</label>
                    <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => handleChange('unit', e.target.value)}
                        placeholder="e.g., KES, %, people, days"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label>Framework <span className={styles.required}>*</span></label>
                    <select
                        value={formData.frameworkId}
                        onChange={(e) => handleChange('frameworkId', e.target.value)}
                        className={errors.frameworkId ? styles.error : ''}
                    >
                        <option value="">Select Framework</option>
                        <option value="1">Commercial Framework v1.0</option>
                        <option value="2">NGO Framework v1.0</option>
                    </select>
                    {errors.frameworkId && <span className={styles.errorText}>{errors.frameworkId}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label>Sector <span className={styles.required}>*</span></label>
                    <select
                        value={formData.sectorId}
                        onChange={(e) => handleChange('sectorId', e.target.value)}
                        className={errors.sectorId ? styles.error : ''}
                    >
                        <option value="">Select Sector</option>
                        <option value="1">Commercial / Corporate</option>
                        <option value="2">NGO / Non-Profit</option>
                        <option value="3">Public Sector</option>
                        <option value="4">Consulting</option>
                    </select>
                    {errors.sectorId && <span className={styles.errorText}>{errors.sectorId}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label>Category</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                    >
                        <option value="">Select Category</option>
                        <option value="1">Financial</option>
                        <option value="2">Impact</option>
                        <option value="3">Operational</option>
                        <option value="4">Customer</option>
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Owner <span className={styles.required}>*</span></label>
                    <select
                        value={formData.ownerId}
                        onChange={(e) => handleChange('ownerId', e.target.value)}
                        className={errors.ownerId ? styles.error : ''}
                    >
                        <option value="">Select Owner</option>
                        <option value="1">John Doe (john@example.com)</option>
                        <option value="2">Jane Smith (jane@example.com)</option>
                    </select>
                    {errors.ownerId && <span className={styles.errorText}>{errors.ownerId}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label>Department</label>
                    <input
                        type="text"
                        value={formData.departmentId}
                        onChange={(e) => handleChange('departmentId', e.target.value)}
                        placeholder="Department ID (optional)"
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
                <button onClick={handleSubmit} className={styles.nextButton}>Next →</button>
            </div>
        </div>
    );
};
KPICreateStep1.propTypes = {
    data: PropTypes.object,
    onNext: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
export default KPICreateStep1;