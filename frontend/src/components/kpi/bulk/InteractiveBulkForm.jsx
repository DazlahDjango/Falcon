import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiTrash2, FiSend, FiCheckCircle, FiAlertCircle, FiLayers, FiUser, FiFolder } from 'react-icons/fi';
import { 
    fetchCategories, 
    selectCategories, 
    fetchUserKPIs, 
    selectUserKPIs 
} from '../../../store/kpi';
import { selectUser } from '../../../store/accounts/selectors/authSelectors';
import { fetchMyEmployment } from '../../../store/structure/slice/employmentSlice';
import { useBulkUpload } from '../../../hooks/kpi';
import UnitSelector from '../common/UnitSelector';
import KPILoading from '../common/KPILoading';

const createEmptyRow = (id, mode) => {
    return {
        id,
        name: '',
        description: '',
        category_id: '',
        kpi_type: 'PERCENTAGE',
        measure_type: 'CUMULATIVE',
        calculation_logic: 'HIGHER_IS_BETTER',
        unit: '%',
        target_value: '',
        kpi_id: '',
        actual_value: '',
        notes: ''
    };
};

const InteractiveBulkForm = () => {
    const dispatch = useDispatch();
    const { submitKPIsForm, submitActualsForm, submitCombinedForm } = useBulkUpload();
    const currentUser = useSelector(selectUser);
    const [userEmployment, setUserEmployment] = useState(null);

    const rawCategories = useSelector(selectCategories) || [];
    const categories = Array.isArray(rawCategories)
        ? rawCategories
        : (rawCategories?.results || rawCategories?.data || []);

    const rawUserKPIs = useSelector(state => selectUserKPIs()(state)) || [];
    const currentUserKPIs = Array.isArray(rawUserKPIs) 
        ? rawUserKPIs 
        : (rawUserKPIs?.results || rawUserKPIs?.data || []);
    
    // Filter currentUserKPIs so only approved & active Performance Indicators are available for actual submissions
    const approvedUserKPIs = currentUserKPIs.filter(k => 
        k.is_active !== false && 
        k.approval_status === 'APPROVED'
    );

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const [mode, setMode] = useState('kpi'); // 'kpi', 'actual', or 'combined'
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [rows, setRows] = useState([createEmptyRow(1, 'kpi'), createEmptyRow(2, 'kpi')]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [serverError, setServerError] = useState(null);

    useEffect(() => {
        dispatch(fetchCategories({ is_active: true }));
        dispatch(fetchUserKPIs({ params: { for_actuals: true } }));
        dispatch(fetchMyEmployment())
            .unwrap()
            .then((empData) => {
                if (empData) setUserEmployment(empData);
            })
            .catch(() => {});
    }, [dispatch]);

    // Dynamically resolve the staff user's exact organizational level and entity name from structure Employment
    const getUserOrgDetails = () => {
        const emp = userEmployment?.current_employment || userEmployment;
        const pos = emp?.position || {};

        const unitObj = pos.unit || emp?.unit;
        const unitName = emp?.unit_name || pos.unit_name || unitObj?.name || (typeof unitObj === 'string' ? unitObj : null);
        if (unitName) return { label: 'Unit', name: unitName };

        const sectionObj = pos.section || emp?.section;
        const sectionName = emp?.section_name || pos.section_name || sectionObj?.name || (typeof sectionObj === 'string' ? sectionObj : null);
        if (sectionName) return { label: 'Section', name: sectionName };

        const deptObj = pos.department || emp?.department;
        const deptName = emp?.department_name || pos.department_name || deptObj?.name || (typeof deptObj === 'string' ? deptObj : null);
        if (deptName) return { label: 'Department', name: deptName };

        const divObj = pos.division || emp?.division;
        const divName = emp?.division_name || pos.division_name || divObj?.name || (typeof divObj === 'string' ? divObj : null);
        if (divName) return { label: 'Division', name: divName };

        if (!currentUser) return { label: 'Department / Unit', name: 'Not Assigned' };

        const fallbackUnit = currentUser.unit_name || (typeof currentUser.unit === 'object' ? currentUser.unit?.name : currentUser.unit);
        if (fallbackUnit) return { label: 'Unit', name: fallbackUnit };

        const fallbackSection = currentUser.section_name || (typeof currentUser.section === 'object' ? currentUser.section?.name : currentUser.section);
        if (fallbackSection) return { label: 'Section', name: fallbackSection };

        const fallbackDept = currentUser.department_name || (typeof currentUser.department === 'object' ? currentUser.department?.name : currentUser.department);
        if (fallbackDept) return { label: 'Department', name: fallbackDept };

        const fallbackDiv = currentUser.division_name || (typeof currentUser.division === 'object' ? currentUser.division?.name : currentUser.division);
        if (fallbackDiv) return { label: 'Division', name: fallbackDiv };

        return { label: currentUser.level_name || 'Department', name: currentUser.department_name || currentUser.department || 'My Organizational Unit' };
    };

    const userOrg = getUserOrgDetails();
    const staffOwnerName = currentUser
        ? (currentUser.full_name || `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.email)
        : 'Logged-in Staff Member';

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setResult(null);
        setServerError(null);
        setRows([createEmptyRow(1, newMode), createEmptyRow(2, newMode)]);
    };

    const handleAddRow = () => {
        setRows(prev => [...prev, createEmptyRow(Date.now(), mode)]);
    };

    const handleRemoveRow = (id) => {
        if (rows.length === 1) return;
        setRows(prev => prev.filter(r => r.id !== id));
    };

    const handleRowChange = (id, field, value) => {
        setRows(prev => prev.map(row => {
            if (row.id !== id) return row;

            const updated = { ...row, [field]: value };
            
            // Adjust unit preset defaults when kpi_type changes
            if (field === 'kpi_type') {
                if (value === 'FINANCIAL') updated.unit = 'KES';
                else if (value === 'PERCENTAGE') updated.unit = '%';
                else if (value === 'COUNT') updated.unit = 'Units';
                else if (value === 'TIME') updated.unit = 'Hours';
                else if (value === 'MILESTONE') updated.unit = 'Yes/No';
                else if (value === 'IMPACT') updated.unit = 'Score (1-5)';
            }
            
            // If KPI selection changes in actual mode, inherit its unit if available
            if (field === 'kpi_id') {
                const selectedKpi = currentUserKPIs.find(k => k.id === value);
                if (selectedKpi?.unit) {
                    updated.unit = selectedKpi.unit;
                }
            }

            return updated;
        }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setServerError(null);
        setResult(null);

        // Validation
        const validRows = rows.filter(r => {
            if (mode === 'kpi' || mode === 'combined') return r.name.trim() !== '';
            if (mode === 'actual') return r.kpi_id !== '' && r.actual_value !== '';
            return false;
        });

        if (validRows.length === 0) {
            setServerError("Please complete at least one valid row before submitting.");
            return;
        }

        setLoading(true);

        try {
            let data;

            if (mode === 'kpi') {
                data = await submitKPIsForm(validRows);
            } else if (mode === 'actual') {
                data = await submitActualsForm(year, month, validRows);
            } else if (mode === 'combined') {
                data = await submitCombinedForm(year, month, validRows);
            }

            setResult(data);
            // Reset rows on complete success
            if (data?.status === 'SUCCESS' && (!data?.data?.errors || data.data.errors.length === 0)) {
                setRows([createEmptyRow(1, mode), createEmptyRow(2, mode)]);
            }
        } catch (err) {
            const errorMsg = typeof err === 'string' 
                ? err 
                : (err?.detail || err?.message || err?.response?.data?.message || "An unexpected error occurred during submission.");
            setServerError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    return (
        <div className="interactive-bulk-form-container" style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
        }}>
            {/* Header & Mode Switcher */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '1rem'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiLayers color="#2563eb" />
                        Interactive Bulk Form Submission
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                        Create multiple Performance Indicators or submit actual entries directly without Excel files
                    </p>
                </div>

                {/* Mode Selector Tabs */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    padding: '4px',
                    borderRadius: '8px',
                    gap: '4px'
                }}>
                    <button
                        type="button"
                        onClick={() => handleModeChange('kpi')}
                        style={{
                            padding: '0.5rem 0.9rem',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: mode === 'kpi' ? '#ffffff' : 'transparent',
                            color: mode === 'kpi' ? '#2563eb' : '#64748b',
                            boxShadow: mode === 'kpi' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                        }}
                    >
                        Create Performance Indicators
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('actual')}
                        style={{
                            padding: '0.5rem 0.9rem',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: mode === 'actual' ? '#ffffff' : 'transparent',
                            color: mode === 'actual' ? '#2563eb' : '#64748b',
                            boxShadow: mode === 'actual' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                        }}
                    >
                        Submit Actual Values
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeChange('combined')}
                        style={{
                            padding: '0.5rem 0.9rem',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: mode === 'combined' ? '#ffffff' : 'transparent',
                            color: mode === 'combined' ? '#2563eb' : '#64748b',
                            boxShadow: mode === 'combined' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                        }}
                    >
                        Combined Creation & Actuals
                    </button>
                </div>
            </div>

            {/* Auto-bound Staff Owner & Structure Level Context Banner */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem',
                fontSize: '0.85rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                    <FiUser size={15} style={{ color: '#0284c7' }} />
                    <span><strong>Submitting As Owner:</strong> {staffOwnerName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                    <FiFolder size={15} style={{ color: '#6366f1' }} />
                    <span><strong>{userOrg.label}:</strong> {userOrg.name}</span>
                </div>
            </div>

            {/* Period Selector (for actuals / combined) */}
            {(mode === 'actual' || mode === 'combined') && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.25rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#eff6ff',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe'
                }}>
                    <strong style={{ fontSize: '0.875rem', color: '#1e40af' }}>Target Period:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#1e3a8a' }}>Year:</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: '#1e3a8a' }}>Month:</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Server Error Alert */}
            {serverError && (
                <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: '0.875rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <FiAlertCircle size={16} />
                    {serverError}
                </div>
            )}

            {/* Success Result Summary Alert */}
            {result && (
                <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: result.data?.error_count > 0 ? '#fffbeb' : '#f0fdf4',
                    border: `1px solid ${result.data?.error_count > 0 ? '#fde68a' : '#bbf7d0'}`,
                    borderRadius: '8px',
                    color: result.data?.error_count > 0 ? '#92400e' : '#166534',
                    fontSize: '0.875rem',
                    marginBottom: '1.25rem'
                }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiCheckCircle size={16} />
                        {result.message}
                    </div>
                    {result.data?.errors?.length > 0 && (
                        <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0, fontSize: '0.8rem' }}>
                            {result.data.errors.map((err, idx) => (
                                <li key={idx}>Row {err.row}: {err.error}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Multi-Row Interactive Form Table */}
            <form onSubmit={handleSubmit}>
                <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                                <th style={{ padding: '0.65rem', width: '40px' }}>#</th>

                                {(mode === 'kpi' || mode === 'combined') && (
                                    <>
                                        <th style={{ padding: '0.65rem', minWidth: '160px' }}>Key Result Area (KRA)</th>
                                        <th style={{ padding: '0.65rem', minWidth: '200px' }}>
                                            Performance Indicator <span style={{ color: '#ef4444' }}>*</span>
                                        </th>
                                        <th style={{ padding: '0.65rem', minWidth: '160px' }}>Description</th>
                                        <th style={{ padding: '0.65rem', minWidth: '140px' }}>Performance Type</th>
                                        <th style={{ padding: '0.65rem', minWidth: '140px' }}>Measure Type</th>
                                        <th style={{ padding: '0.65rem', minWidth: '150px' }}>Calculation Logic</th>
                                        <th style={{ padding: '0.65rem', minWidth: '160px' }}>Unit of Measure Tab</th>
                                        <th style={{ padding: '0.65rem', minWidth: '130px' }}>Target Value</th>
                                    </>
                                )}

                                {mode === 'actual' && (
                                    <>
                                        <th style={{ padding: '0.65rem', minWidth: '260px' }}>
                                            Performance Indicator <span style={{ color: '#ef4444' }}>*</span>
                                        </th>
                                        <th style={{ padding: '0.65rem', minWidth: '140px' }}>
                                            Actual Value <span style={{ color: '#ef4444' }}>*</span>
                                        </th>
                                        <th style={{ padding: '0.65rem', minWidth: '220px' }}>Remarks</th>
                                    </>
                                )}

                                {mode === 'combined' && (
                                    <th style={{ padding: '0.65rem', minWidth: '140px' }}>Initial Actual Value</th>
                                )}

                                <th style={{ padding: '0.65rem', width: '50px', textAlign: 'center' }}></th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.65rem', fontWeight: 600, color: '#64748b' }}>
                                        {index + 1}
                                    </td>

                                    {(mode === 'kpi' || mode === 'combined') && (
                                        <>
                                            {/* 1. Key Result Area (KRA) */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <select
                                                    value={row.category_id}
                                                    onChange={(e) => handleRowChange(row.id, 'category_id', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.85rem',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                >
                                                    <option value="">Select KRA...</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* 2. Performance Indicator */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={row.name}
                                                    onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                                                    placeholder="e.g. Sales Volume"
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.85rem'
                                                    }}
                                                />
                                            </td>

                                            {/* 3. Description */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={row.description}
                                                    onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
                                                    placeholder="Brief description..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.85rem'
                                                    }}
                                                />
                                            </td>

                                            {/* 4. Performance Type */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <select
                                                    value={row.kpi_type}
                                                    onChange={(e) => handleRowChange(row.id, 'kpi_type', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.85rem',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                >
                                                    <option value="COUNT">Count / Number</option>
                                                    <option value="PERCENTAGE">Percentage (%)</option>
                                                    <option value="FINANCIAL">Financial Amount</option>
                                                    <option value="TIME">Time / Turnaround</option>
                                                    <option value="MILESTONE">Yes/No Milestone</option>
                                                    <option value="IMPACT">Impact Score</option>
                                                </select>
                                            </td>

                                            {/* 5. Measure Type */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <select
                                                    value={row.measure_type}
                                                    onChange={(e) => handleRowChange(row.id, 'measure_type', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.85rem',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                >
                                                    <option value="CUMULATIVE">Cumulative (YTD)</option>
                                                    <option value="NON_CUMULATIVE">Non-Cumulative</option>
                                                </select>
                                            </td>

                                            {/* 6. Calculation Logic */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <select
                                                    value={row.calculation_logic}
                                                    onChange={(e) => handleRowChange(row.id, 'calculation_logic', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.85rem',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                >
                                                    <option value="HIGHER_IS_BETTER">Higher is Better</option>
                                                    <option value="LOWER_IS_BETTER">Lower is Better</option>
                                                </select>
                                            </td>

                                            {/* 7. Unit Selector */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <UnitSelector
                                                    kpiType={row.kpi_type}
                                                    value={row.unit}
                                                    onChange={(newUnit) => handleRowChange(row.id, 'unit', newUnit)}
                                                />
                                            </td>

                                            {/* 7b. Target Value with Horizontal Unit Badge */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={row.target_value}
                                                        onChange={(e) => handleRowChange(row.id, 'target_value', e.target.value)}
                                                        placeholder="100"
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem 0.65rem',
                                                            borderRadius: '6px 0 0 6px',
                                                            border: '1px solid #cbd5e1',
                                                            fontSize: '0.85rem',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                    <div style={{
                                                        padding: '0.5rem 0.6rem',
                                                        backgroundColor: '#f1f5f9',
                                                        border: '1px solid #cbd5e1',
                                                        borderLeft: 'none',
                                                        borderRadius: '0 6px 6px 0',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        color: '#475569',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {row.unit || '%'}
                                                    </div>
                                                </div>
                                            </td>
                                        </>
                                    )}

                                    {mode === 'actual' && (
                                        <>
                                            {/* KPI Dropdown */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <select
                                                    value={row.kpi_id}
                                                    onChange={(e) => handleRowChange(row.id, 'kpi_id', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.85rem',
                                                        backgroundColor: '#ffffff'
                                                    }}
                                                >
                                                     <option value="">Select Performance Indicator...</option>
                                                     {approvedUserKPIs.map(k => (
                                                         <option key={k.id} value={k.id}>{k.name}</option>
                                                     ))}
                                                </select>
                                            </td>

                                            {/* Actual Value */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        value={row.actual_value}
                                                        onChange={(e) => handleRowChange(row.id, 'actual_value', e.target.value)}
                                                        placeholder="85.5"
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem 0.65rem',
                                                            borderRadius: '6px 0 0 6px',
                                                            border: '1px solid #cbd5e1',
                                                            fontSize: '0.85rem',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                    <div style={{
                                                        padding: '0.5rem 0.6rem',
                                                        backgroundColor: '#f1f5f9',
                                                        border: '1px solid #cbd5e1',
                                                        borderLeft: 'none',
                                                        borderRadius: '0 6px 6px 0',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        color: '#475569',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {row.unit || '%'}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Notes */}
                                            <td style={{ padding: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={row.notes}
                                                    onChange={(e) => handleRowChange(row.id, 'notes', e.target.value)}
                                                    placeholder="Monthly progress remarks..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.65rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.85rem'
                                                    }}
                                                />
                                            </td>
                                        </>
                                    )}

                                    {mode === 'combined' && (
                                        <td style={{ padding: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={row.actual_value}
                                                    onChange={(e) => handleRowChange(row.id, 'actual_value', e.target.value)}
                                                    placeholder="e.g. 75"
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem 0.65rem',
                                                        borderRadius: '6px 0 0 6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.85rem',
                                                        outline: 'none'
                                                    }}
                                                />
                                                <div style={{
                                                    padding: '0.5rem 0.6rem',
                                                    backgroundColor: '#f1f5f9',
                                                    border: '1px solid #cbd5e1',
                                                    borderLeft: 'none',
                                                    borderRadius: '0 6px 6px 0',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    color: '#475569',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {row.unit || '%'}
                                                </div>
                                            </div>
                                        </td>
                                    )}

                                    {/* Action Column */}
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRow(row.id)}
                                            disabled={rows.length === 1}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: rows.length === 1 ? '#cbd5e1' : '#ef4444',
                                                cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                                                padding: '0.35rem',
                                                borderRadius: '4px'
                                            }}
                                            title="Delete Row"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer Controls */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f1f5f9'
                }}>
                    <button
                        type="button"
                        onClick={handleAddRow}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            border: '1px dashed #3b82f6',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        <FiPlus size={16} />
                        Add Row
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem 1.4rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        <FiSend size={16} />
                        {loading ? 'Submitting...' : 'Submit All Rows'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Helper cookie reader for CSRF tokens
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default InteractiveBulkForm;
