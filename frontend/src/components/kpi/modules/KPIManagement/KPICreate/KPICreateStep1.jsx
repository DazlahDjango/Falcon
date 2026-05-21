import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../../../../store/accounts/slice/userSlice';
import {
    fetchSectors,
    fetchFrameworks,
    fetchCategories
} from '../../../../../store/kpi/slice/kpi/frameworkSlice';
import { useKpiReferenceData } from '../../../../../hooks/kpi/useReferenceData';
import styles from './KPICreate.module.css';

const KPICreateStep1 = ({ data, onNext, onCancel }) => {
    const dispatch = useDispatch();

    // Selectors for real data with robust defensive defaults
    const frameworkState = useSelector(state => state.framework || {});
    
    const sectors = Array.isArray(frameworkState.sectors?.items) 
        ? frameworkState.sectors.items 
        : [];
    const sectorsLoading = frameworkState.sectors?.loading || false;
    
    const frameworks = Array.isArray(frameworkState.frameworks?.items) 
        ? frameworkState.frameworks.items 
        : [];
    const frameworksLoading = frameworkState.frameworks?.loading || false;
    
    const categories = Array.isArray(frameworkState.categories?.items) 
        ? frameworkState.categories.items 
        : [];
    const categoriesLoading = frameworkState.categories?.loading || false;
    
    const { users: refUsers, departments, isLoading: refLoading } = useKpiReferenceData();
    const usersState = useSelector(state => state.users || {});
    const users = refUsers.length ? refUsers : (usersState.users || []);
    const usersLoading = refLoading || usersState.isLoading || false;

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

    // Fetch data on mount
    useEffect(() => {
        dispatch(fetchSectors());
        dispatch(fetchFrameworks());
        dispatch(fetchCategories());
        dispatch(fetchUsers({ page_size: 100 })); // Fetch more users for selection
    }, [dispatch]);

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
            <div className={styles.stepHeader}>
                <h3>Basic Information</h3>
                <p>Define the core identity and logic of your KPI.</p>
            </div>

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
                    <small className={styles.helperText}>Use uppercase letters, numbers, and underscores</small>
                </div>

                <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                    <label>Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={2}
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
                                {logic.label}
                            </option>
                        ))}
                    </select>
                    <small className={styles.helperText}>
                        {calculationLogics.find(l => l.value === formData.calculationLogic)?.formula}
                    </small>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Measure Type</label>
                    <select
                        value={formData.measureType}
                        onChange={(e) => handleChange('measureType', e.target.value)}
                    >
                        {measureTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <small className={styles.helperText}>
                        {measureTypes.find(t => t.value === formData.measureType)?.desc}
                    </small>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Unit</label>
                    <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => handleChange('unit', e.target.value)}
                        placeholder="e.g., KES, %, people"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label>Framework <span className={styles.required}>*</span></label>
                    <select
                        value={formData.frameworkId}
                        onChange={(e) => handleChange('frameworkId', e.target.value)}
                        className={errors.frameworkId ? styles.error : ''}
                        disabled={frameworksLoading}
                    >
                        <option value="">{frameworksLoading ? 'Loading...' : 'Select Framework'}</option>
                        {frameworks.map(fw => (
                            <option key={fw.id} value={fw.id}>{fw.name}</option>
                        ))}
                    </select>
                    {errors.frameworkId && <span className={styles.errorText}>{errors.frameworkId}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label>Sector <span className={styles.required}>*</span></label>
                    <select
                        value={formData.sectorId}
                        onChange={(e) => handleChange('sectorId', e.target.value)}
                        className={errors.sectorId ? styles.error : ''}
                        disabled={sectorsLoading}
                    >
                        <option value="">{sectorsLoading ? 'Loading...' : 'Select Sector'}</option>
                        {sectors.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    {errors.sectorId && <span className={styles.errorText}>{errors.sectorId}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label>Category</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                        disabled={categoriesLoading}
                    >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.fieldGroup}>
                    <label>Owner <span className={styles.required}>*</span></label>
                    <select
                        value={formData.ownerId}
                        onChange={(e) => handleChange('ownerId', e.target.value)}
                        className={errors.ownerId ? styles.error : ''}
                        disabled={usersLoading}
                    >
                        <option value="">{usersLoading ? 'Loading...' : 'Select Owner'}</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.first_name} {u.last_name} ({u.email})
                            </option>
                        ))}
                    </select>
                    {errors.ownerId && <span className={styles.errorText}>{errors.ownerId}</span>}
                </div>

                <div className={styles.fieldGroup}>
                    <label>Department</label>
                    <select
                        value={formData.departmentId}
                        onChange={(e) => handleChange('departmentId', e.target.value)}
                        disabled={refLoading}
                    >
                        <option value="">Select department (optional)</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}{d.code ? ` (${d.code})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
                <button onClick={handleSubmit} className={styles.nextButton}>
                    Next Step <span>→</span>
                </button>
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