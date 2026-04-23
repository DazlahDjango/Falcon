import React from 'react';
import PropTypes from 'prop-types';
import styles from './KPIForm.module.css';

const KPIFormFields = ({ formData, onChange, errors, frameworks, sectors, categories, users }) => {
    const kpiTypes = [
        { value: 'COUNT', label: 'Count / Number' },
        { value: 'PERCENTAGE', label: 'Percentage (%)' },
        { value: 'FINANCIAL', label: 'Financial Amount' },
        { value: 'MILESTONE', label: 'Yes / No Milestone' },
        { value: 'TIME', label: 'Time / Turnaround' },
        { value: 'IMPACT', label: 'Impact Score' },
    ];
    const calculationLogics = [
        { value: 'HIGHER_IS_BETTER', label: 'Higher is Better', formula: '(Actual ÷ Target) × 100' },
        { value: 'LOWER_IS_BETTER', label: 'Lower is Better', formula: '(Target ÷ Actual) × 100' },
    ];
    const measureTypes = [
        { value: 'CUMULATIVE', label: 'Cumulative (YTD)', desc: 'Values add up over time' },
        { value: 'NON_CUMULATIVE', label: 'Non-Cumulative', desc: 'Period-only values' },
    ];
    return (
        <div className={styles.basicSection}>
            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    KPI Name <span className={styles.required}>*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="e.g., Revenue Growth"
                    className={`${styles.input} ${errors.name ? styles.error : ''}`}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>
                    KPI Code <span className={styles.required}>*</span>
                </label>
                <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => onChange('code', e.target.value.toUpperCase())}
                    placeholder="e.g., REV_001"
                    className={`${styles.input} ${errors.code ? styles.error : ''}`}
                />
                {errors.code && <span className={styles.errorText}>{errors.code}</span>}
                <small className={styles.hint}>Use uppercase letters, numbers, underscores, and hyphens</small>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder="Describe what this KPI measures and how it's calculated"
                    className={styles.textarea}
                    rows={3}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        KPI Type <span className={styles.required}>*</span>
                    </label>
                    <select
                        value={formData.kpiType}
                        onChange={(e) => onChange('kpiType', e.target.value)}
                        className={`${styles.select} ${errors.kpiType ? styles.error : ''}`}
                    >
                        {kpiTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                    {errors.kpiType && <span className={styles.errorText}>{errors.kpiType}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Calculation Logic <span className={styles.required}>*</span>
                    </label>
                    <select
                        value={formData.calculationLogic}
                        onChange={(e) => onChange('calculationLogic', e.target.value)}
                        className={`${styles.select} ${errors.calculationLogic ? styles.error : ''}`}
                    >
                        {calculationLogics.map(logic => (
                            <option key={logic.value} value={logic.value}>
                                {logic.label} ({logic.formula})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Measure Type</label>
                    <select
                        value={formData.measureType}
                        onChange={(e) => onChange('measureType', e.target.value)}
                        className={styles.select}
                    >
                        {measureTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label} - {type.desc}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Unit</label>
                    <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => onChange('unit', e.target.value)}
                        placeholder="e.g., KES, %, people"
                        className={styles.input}
                    />
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Framework <span className={styles.required}>*</span>
                    </label>
                    <select
                        value={formData.frameworkId}
                        onChange={(e) => onChange('frameworkId', e.target.value)}
                        className={`${styles.select} ${errors.frameworkId ? styles.error : ''}`}
                    >
                        <option value="">Select Framework</option>
                        {frameworks.map(fw => (
                            <option key={fw.id} value={fw.id}>{fw.name} (v{fw.version})</option>
                        ))}
                    </select>
                    {errors.frameworkId && <span className={styles.errorText}>{errors.frameworkId}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Sector <span className={styles.required}>*</span>
                    </label>
                    <select
                        value={formData.sectorId}
                        onChange={(e) => onChange('sectorId', e.target.value)}
                        className={`${styles.select} ${errors.sectorId ? styles.error : ''}`}
                    >
                        <option value="">Select Sector</option>
                        {sectors.map(sector => (
                            <option key={sector.id} value={sector.id}>{sector.name}</option>
                        ))}
                    </select>
                    {errors.sectorId && <span className={styles.errorText}>{errors.sectorId}</span>}
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Category</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => onChange('categoryId', e.target.value)}
                        className={styles.select}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        Owner <span className={styles.required}>*</span>
                    </label>
                    <select
                        value={formData.ownerId}
                        onChange={(e) => onChange('ownerId', e.target.value)}
                        className={`${styles.select} ${errors.ownerId ? styles.error : ''}`}
                    >
                        <option value="">Select Owner</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                        ))}
                    </select>
                    {errors.ownerId && <span className={styles.errorText}>{errors.ownerId}</span>}
                </div>
            </div>

            <div className={styles.fieldGroup}>
                <label className={styles.label}>Department</label>
                <input
                    type="text"
                    value={formData.departmentId || ''}
                    onChange={(e) => onChange('departmentId', e.target.value)}
                    placeholder="Department ID (optional)"
                    className={styles.input}
                />
            </div>
        </div>
    );
};
KPIFormFields.propTypes = {
    formData: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object,
    frameworks: PropTypes.array,
    sectors: PropTypes.array,
    categories: PropTypes.array,
    users: PropTypes.array,
};
KPIFormFields.defaultProps = {
    frameworks: [],
    sectors: [],
    categories: [],
    users: [],
};
export default KPIFormFields;