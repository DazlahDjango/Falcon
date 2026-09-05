import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiX, FiCheck, FiTarget, FiHelpCircle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import {
    createKPI,
    fetchCategories,
    selectCategories,
    fetchReferenceData
} from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';
import UnitSelector from '../../common/UnitSelector';
import KPICreateSuccess from './KPICreateSuccess';

const KPICreate = ({ onComplete, onCancel, initialCategoryId }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const categories = useSelector(selectCategories);
    const defaultCategoryId = initialCategoryId || location.state?.categoryId || '';

    const [loading, setLoading] = useState(false);
    const [refLoading, setRefLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [referenceData, setReferenceData] = useState({ users: [], departments: [] });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        kpi_type: 'PERCENTAGE',
        calculation_logic: 'HIGHER_IS_BETTER',
        measure_type: 'CUMULATIVE',
        unit: '%',
        target_value: '',
        decimal_places: 2,
        category_id: defaultCategoryId,
        owner_id: '',
        department_id: '',
        strategic_objective: '',
        is_active: true,
        metadata: {}
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        dispatch(fetchCategories({ is_active: true }));

        const loadRefData = async () => {
            setRefLoading(true);
            try {
                const result = await dispatch(fetchReferenceData(['users', 'departments'])).unwrap();
                setReferenceData(result || { users: [], departments: [] });
            } catch (err) {
                console.error('Failed to load reference data:', err);
            } finally {
                setRefLoading(false);
            }
        };
        loadRefData();
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
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            // If KPI type changes, reset default unit if appropriate
            if (field === 'kpi_type') {
                if (value === 'FINANCIAL') updated.unit = 'KES';
                else if (value === 'PERCENTAGE') updated.unit = '%';
                else if (value === 'COUNT') updated.unit = 'Units';
                else if (value === 'TIME') updated.unit = 'Hours';
                else if (value === 'MILESTONE') updated.unit = 'Yes/No';
                else if (value === 'IMPACT') updated.unit = 'Score (1-5)';
            }
            return updated;
        });

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Performance Indicator name is required';
        if (!formData.owner_id) newErrors.owner_id = 'Owner is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const targetVal = formData.target_value !== '' ? parseFloat(formData.target_value) : null;
            const completeData = {
                ...formData,
                target_min: targetVal,
                target_max: targetVal,
                // Ensure null optional fields are handled cleanly
                category_id: formData.category_id || null,
                department_id: formData.department_id || null,
            };

            const result = await dispatch(createKPI(completeData)).unwrap();
            setSubmitted(true);
            setTimeout(() => {
                if (onComplete) onComplete(result);
            }, 1500);
        } catch (error) {
            console.error('Failed to create KPI:', error);
            setErrors(prev => ({
                ...prev,
                submit: error?.message || error?.detail || 'Failed to create Performance Indicator. Please try again.'
            }));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <KPILoading text="Creating Performance Indicator..." />;
    }

    if (submitted) {
        return <KPICreateSuccess onClose={onCancel} />;
    }

    return (
        <div className="kpi-create-modal-overlay" onClick={onCancel} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
        }}>
            <div className="kpi-create-modal" onClick={(e) => e.stopPropagation()} style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '820px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div className="kpi-create-header" style={{
                    padding: '1.25rem 1.75rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FiTarget size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                Create New Performance Indicator
                            </h2>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                                Fill in the details below to define and activate a performance metric
                            </p>
                        </div>
                    </div>
                    <button
                        className="kpi-create-close"
                        onClick={onCancel}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="kpi-create-content" style={{
                    padding: '1.75rem',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {errors.submit && (
                        <div style={{
                            padding: '0.85rem 1rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '10px',
                            color: '#991b1b',
                            fontSize: '0.875rem',
                            marginBottom: '1.25rem'
                        }}>
                            {errors.submit}
                        </div>
                    )}

                    {refLoading ? (
                        <KPILoading size="sm" text="Loading form options..." />
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Section 1: Core Identity */}
                            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '6px', height: '14px', backgroundColor: '#2563eb', borderRadius: '3px' }}></span>
                                    Basic Information
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Performance Indicator <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            placeholder="e.g., Revenue Growth, Customer Satisfaction Index"
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '8px',
                                                border: errors.name ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                        {errors.name && <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            rows={2}
                                            placeholder="Describe what this Performance Indicator measures, how it is calculated, and its key business impact..."
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.9rem',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Metric Type & Logic */}
                            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '6px', height: '14px', backgroundColor: '#0284c7', borderRadius: '3px' }}></span>
                                    Metric Type & Logic
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Performance Indicator Type <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <select
                                            value={formData.kpi_type}
                                            onChange={(e) => handleChange('kpi_type', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.9rem',
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            {kpiTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Calculation Logic <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <select
                                            value={formData.calculation_logic}
                                            onChange={(e) => handleChange('calculation_logic', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.9rem',
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            {calculationLogics.map(logic => (
                                                <option key={logic.value} value={logic.value}>{logic.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Measure Type
                                        </label>
                                        <select
                                            value={formData.measure_type}
                                            onChange={(e) => handleChange('measure_type', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.9rem',
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            {measureTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Unit & Target Configuration */}
                            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '6px', height: '14px', backgroundColor: '#059669', borderRadius: '3px' }}></span>
                                    Unit & Target Configuration
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

                                    {/* Unit of Measure Selector */}
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Unit of Measure
                                        </label>
                                        <UnitSelector
                                            kpiType={formData.kpi_type}
                                            value={formData.unit}
                                            onChange={(newUnit) => handleChange('unit', newUnit)}
                                        />
                                        <small style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                                            Select from presets or choose "Others..." to type a custom unit
                                        </small>
                                    </div>

                                    {/* Target Value with Horizontal Unit Badge */}
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Target Value
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <input
                                                type="number"
                                                step="any"
                                                value={formData.target_value}
                                                onChange={(e) => handleChange('target_value', e.target.value)}
                                                placeholder="e.g. 100"
                                                style={{
                                                    flex: 1,
                                                    padding: '0.65rem 0.85rem',
                                                    borderRadius: '8px 0 0 8px',
                                                    border: '1px solid #cbd5e1',
                                                    fontSize: '0.9rem',
                                                    outline: 'none'
                                                }}
                                            />
                                            <div style={{
                                                padding: '0.65rem 1rem',
                                                backgroundColor: '#f1f5f9',
                                                border: '1px solid #cbd5e1',
                                                borderLeft: 'none',
                                                borderRadius: '0 8px 8px 0',
                                                fontWeight: 600,
                                                fontSize: '0.85rem',
                                                color: '#334155',
                                                minWidth: '65px',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap',
                                                boxSizing: 'border-box'
                                            }}>
                                                {formData.unit || '%'}
                                            </div>
                                        </div>
                                        <small style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                                            Single target goal for this metric
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Key Result Area & Ownership */}
                            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '6px', height: '14px', backgroundColor: '#7c3aed', borderRadius: '3px' }}></span>
                                    Key Result Area & Ownership
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Key Result Area
                                        </label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => handleChange('category_id', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.9rem',
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            <option value="">Select Key Result Area...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Owner <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <select
                                            value={formData.owner_id}
                                            onChange={(e) => handleChange('owner_id', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '8px',
                                                border: errors.owner_id ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                                fontSize: '0.9rem',
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            <option value="">Select Owner...</option>
                                            {referenceData.users?.map(u => (
                                                <option key={u.id} value={u.id}>
                                                    {u.full_name || u.email} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.owner_id && <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem', display: 'block' }}>{errors.owner_id}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Department (Optional)
                                        </label>
                                        <select
                                            value={formData.department_id}
                                            onChange={(e) => handleChange('department_id', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.9rem',
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            <option value="">Select Department...</option>
                                            {referenceData.departments?.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                        Strategic Objective (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.strategic_objective}
                                        onChange={(e) => handleChange('strategic_objective', e.target.value)}
                                        placeholder="e.g. Expand market coverage and operational performance"
                                        style={{
                                            width: '100%',
                                            padding: '0.65rem 0.85rem',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Section 5: Preferences & Activation */}
                            <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '6px', height: '14px', backgroundColor: '#eab308', borderRadius: '3px' }}></span>
                                    Display & Activation
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                                            Decimal Places
                                        </label>
                                        <select
                                            value={formData.decimal_places}
                                            onChange={(e) => handleChange('decimal_places', parseInt(e.target.value))}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem 0.85rem',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                fontSize: '0.9rem',
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            <option value={0}>0 (Whole numbers)</option>
                                            <option value={1}>1 (0.0)</option>
                                            <option value={2}>2 (0.00)</option>
                                            <option value={3}>3 (0.000)</option>
                                        </select>
                                    </div>

                                    <div className="form-group" style={{ paddingTop: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => handleChange('is_active', e.target.checked)}
                                                style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                                            />
                                            Activate immediately after creation
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="kpi-create-footer" style={{
                    padding: '1.25rem 1.75rem',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    backgroundColor: '#f8fafc'
                }}>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            padding: '0.65rem 1.25rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={loading || refLoading}
                        style={{
                            padding: '0.65rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: (loading || refLoading) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        <FiCheck size={16} />
                        {loading ? 'Creating...' : 'Create Performance Indicator'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KPICreate;