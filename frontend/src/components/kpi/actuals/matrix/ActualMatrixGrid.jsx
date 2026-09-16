import React, { useState, useMemo } from 'react';
import {
    FiSearch, FiCalendar, FiPlus, FiCheckCircle,
    FiClock, FiAlertCircle, FiInbox, FiTrendingUp,
    FiUser, FiUsers, FiChevronDown, FiChevronRight, FiFilter
} from 'react-icons/fi';
import './matrix.css';

const MONTHS = [
    { num: 1, short: 'Jan', full: 'January' },
    { num: 2, short: 'Feb', full: 'February' },
    { num: 3, short: 'Mar', full: 'March' },
    { num: 4, short: 'Apr', full: 'April' },
    { num: 5, short: 'May', full: 'May' },
    { num: 6, short: 'Jun', full: 'June' },
    { num: 7, short: 'Jul', full: 'July' },
    { num: 8, short: 'Aug', full: 'August' },
    { num: 9, short: 'Sep', full: 'September' },
    { num: 10, short: 'Oct', full: 'October' },
    { num: 11, short: 'Nov', full: 'November' },
    { num: 12, short: 'Dec', full: 'December' }
];

const formatVal = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    const num = Number(val);
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
    }
    if (num >= 10_000) {
        return `${(num / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const ActualMatrixGrid = ({
    actuals = [],
    kpis = [],
    targets = [],
    selectedYear,
    onYearChange,
    onCellClick,
    onAddClick,
    loading = false
}) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const year = selectedYear || currentYear;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserFilter, setSelectedUserFilter] = useState('ALL');
    const [expandedKpis, setExpandedKpis] = useState({});

    const yearOptions = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2];

    // Toggle expand for a KPI to reveal multi-employee breakdown
    const toggleExpand = (kpiId) => {
        setExpandedKpis(prev => ({
            ...prev,
            [kpiId]: !prev[kpiId]
        }));
    };

    // Extract all unique employees found across actuals and targets
    const uniqueEmployees = useMemo(() => {
        const userMap = new Map();
        (actuals || []).forEach(a => {
            const uId = a.user_id || a.user?.id || a.user;
            const uName = a.user_full_name || a.user_name || a.user?.get_full_name || a.user_email || a.user?.email;
            if (uId && !userMap.has(String(uId))) {
                userMap.set(String(uId), {
                    id: String(uId),
                    name: uName || 'Team Member',
                    email: a.user_email || a.user?.email || ''
                });
            }
        });
        (targets || []).forEach(t => {
            const uId = t.user || t.user_id || t.user?.id;
            const uName = t.user_full_name || t.user_name || t.user_email || t.user?.email;
            if (uId && !userMap.has(String(uId))) {
                userMap.set(String(uId), {
                    id: String(uId),
                    name: uName || 'Team Member',
                    email: t.user_email || t.user?.email || ''
                });
            }
        });
        return Array.from(userMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [actuals, targets]);

    // Build consolidated multi-employee matrix data
    const kpiMatrixData = useMemo(() => {
        const kpiMap = new Map();

        // 1. Initialize KPIs
        const rawKpis = Array.isArray(kpis) ? kpis : (kpis?.results || []);
        rawKpis.forEach(k => {
            if (k && k.id) {
                kpiMap.set(String(k.id), {
                    id: String(k.id),
                    name: k.name,
                    code: k.code,
                    unit: k.unit || '',
                    category: k.category_name || k.category?.name || 'General',
                    target_value: k.annual_target || k.target_max || k.target_min || null,
                    measure_type: k.measure_type || 'CUMULATIVE',
                    months: {}, // monthNum -> array of actuals
                    assignees: new Map() // userId -> { user_id, user_name, user_email, months: {}, target_value }
                });
            }
        });

        // 2. Map targets for the selected year into each KPI's assignees
        (targets || []).forEach(target => {
            if (!target) return;
            if (target.year && Number(target.year) !== Number(year)) return;
            const kpiId = String(target.kpi || target.kpi_id || target.kpi?.id);
            if (!kpiId) return;

            if (!kpiMap.has(kpiId)) {
                kpiMap.set(kpiId, {
                    id: kpiId,
                    name: target.kpi_name || target.kpi?.name || 'Performance Indicator',
                    code: target.kpi_code || '',
                    unit: target.kpi?.unit || '',
                    category: 'General',
                    target_value: target.kpi?.annual_target || null,
                    measure_type: 'CUMULATIVE',
                    months: {},
                    assignees: new Map()
                });
            }

            const row = kpiMap.get(kpiId);
            const uId = String(target.user || target.user_id || target.user?.id || 'unassigned');
            const uName = target.user_full_name || target.user_name || target.user_email || target.user?.email || 'Team Member';
            const uEmail = target.user_email || target.user?.email || '';

            if (!row.assignees.has(uId)) {
                row.assignees.set(uId, {
                    user_id: uId,
                    user_name: uName,
                    user_email: uEmail,
                    target_value: target.target_value || null,
                    months: {}
                });
            } else {
                const existing = row.assignees.get(uId);
                if (target.target_value) existing.target_value = target.target_value;
                if (uName && uName !== 'Team Member') existing.user_name = uName;
                if (uEmail) existing.user_email = uEmail;
            }
        });

        // 3. Map actuals for the selected year into each KPI and its assignees
        (actuals || []).forEach(actual => {
            if (!actual) return;
            const actualYear = Number(actual.year);
            if (actualYear !== Number(year)) return;

            const kpiId = String(actual.kpi_id || actual.kpi?.id || actual.kpi);
            if (!kpiMap.has(kpiId)) {
                kpiMap.set(kpiId, {
                    id: kpiId,
                    name: actual.kpi_name || actual.kpi?.name || 'Performance Indicator',
                    code: actual.kpi_code || '',
                    unit: actual.kpi?.unit || '',
                    category: 'General',
                    target_value: null,
                    measure_type: 'CUMULATIVE',
                    months: {},
                    assignees: new Map()
                });
            }

            const row = kpiMap.get(kpiId);
            const m = Number(actual.month);
            const uId = String(actual.user_id || actual.user?.id || actual.user || 'unassigned');
            const uName = actual.user_full_name || actual.user_name || actual.user?.get_full_name || actual.user_email || 'Team Member';
            const uEmail = actual.user_email || actual.user?.email || '';

            // Add to KPI-level month list
            if (m >= 1 && m <= 12) {
                if (!row.months[m]) row.months[m] = [];
                row.months[m].push(actual);

                // Add to Assignee-level sub-row
                if (!row.assignees.has(uId)) {
                    row.assignees.set(uId, {
                        user_id: uId,
                        user_name: uName,
                        user_email: uEmail,
                        target_value: actual.target_value || null,
                        months: {}
                    });
                }
                const assignee = row.assignees.get(uId);
                assignee.months[m] = actual;
                if (actual.target_value && !assignee.target_value) {
                    assignee.target_value = actual.target_value;
                }
                if (uName && uName !== 'Team Member') {
                    assignee.user_name = uName;
                }
                if (uEmail) {
                    assignee.user_email = uEmail;
                }
            }
        });

        return Array.from(kpiMap.values());
    }, [kpis, targets, actuals, year]);

    // Filter by search term and selected employee
    const filteredRows = useMemo(() => {
        let result = kpiMatrixData;

        // Filter by employee
        if (selectedUserFilter !== 'ALL') {
            result = result.map(row => {
                const hasAssignee = row.assignees.has(selectedUserFilter);
                if (!hasAssignee) return null;
                // Focus only on that assignee
                const assigneeData = row.assignees.get(selectedUserFilter);
                return {
                    ...row,
                    focusedAssignee: assigneeData
                };
            }).filter(Boolean);
        }

        // Filter by search text
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            result = result.filter(row =>
                row.name.toLowerCase().includes(q) ||
                (row.code && row.code.toLowerCase().includes(q)) ||
                (row.category && row.category.toLowerCase().includes(q))
            );
        }

        return result;
    }, [kpiMatrixData, searchTerm, selectedUserFilter]);

    return (
        <div className="kpi-actual-matrix-wrapper">
            {/* Header controls */}
            <div className="kpi-actual-matrix-header">
                <div className="kpi-actual-matrix-title-group">
                    <h2>
                        <FiTrendingUp color="#0284c7" />
                        Monthly Actuals Matrix — {year}
                    </h2>
                    <p>
                        Track and compare month-by-month actual performance for each performance indicator across the entire team
                    </p>
                </div>

                <div className="kpi-actual-matrix-controls">
                    {/* Employee Filter */}
                    {uniqueEmployees.length > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiUsers size={14} color="#64748b" />
                            <select
                                className="kpi-matrix-year-select"
                                value={selectedUserFilter}
                                onChange={(e) => setSelectedUserFilter(e.target.value)}
                                style={{ maxWidth: 200 }}
                            >
                                <option value="ALL">All Team Members ({uniqueEmployees.length})</option>
                                {uniqueEmployees.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="kpi-matrix-search-box">
                        <FiSearch size={14} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Filter indicators..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiCalendar size={14} color="#64748b" />
                        <select
                            className="kpi-matrix-year-select"
                            value={year}
                            onChange={(e) => onYearChange && onYearChange(Number(e.target.value))}
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="kpi-actual-matrix-scroll-container">
                <table className="kpi-actual-matrix-table">
                    <thead>
                        <tr>
                            <th className="col-kpi">Performance Indicator / Assignee</th>
                            <th className="col-target">Target</th>
                            {MONTHS.map(m => {
                                const isCurrent = year === currentYear && m.num === currentMonth;
                                return (
                                    <th
                                        key={m.num}
                                        className={`col-month ${isCurrent ? 'current-month' : ''}`}
                                        title={`${m.full} ${year}`}
                                    >
                                        {m.short}
                                    </th>
                                );
                            })}
                            <th className="col-ytd">YTD Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={15} style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                                    <FiInbox size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                                    <div style={{ fontWeight: 600, color: '#475569' }}>No Performance Indicators Found</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                                        {searchTerm ? 'Try adjusting your search filter' : 'No indicators are currently assigned for this period.'}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredRows.map(row => {
                                const isExpanded = Boolean(expandedKpis[row.id] || selectedUserFilter !== 'ALL');
                                const assigneesList = Array.from(row.assignees.values());
                                const hasAssignees = assigneesList.length > 0;
                                const hasMultipleAssignees = assigneesList.length > 1;

                                // Calculate KPI Level YTD
                                let totalAchieved = 0;
                                let submissionCount = 0;
                                MONTHS.forEach(m => {
                                    const actualsList = row.months[m.num] || [];
                                    actualsList.forEach(a => {
                                        totalAchieved += (Number(a.actual_value) || 0);
                                        submissionCount += 1;
                                    });
                                });

                                const ytdDisplayVal = row.measure_type === 'NON_CUMULATIVE' && submissionCount > 0
                                    ? (totalAchieved / submissionCount)
                                    : totalAchieved;

                                const targetNum = Number(row.target_value) || 0;
                                const progressPct = targetNum > 0 ? Math.min(Math.round((ytdDisplayVal / targetNum) * 100), 100) : null;

                                return (
                                    <React.Fragment key={row.id}>
                                        {/* Main KPI Row */}
                                        <tr className={`kpi-main-row ${isExpanded ? 'is-expanded' : ''}`}>
                                            {/* KPI Title & Assignee Toggle */}
                                            <td className="cell-kpi">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {hasAssignees && (
                                                        <button
                                                            onClick={() => toggleExpand(row.id)}
                                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#0284c7', padding: 0 }}
                                                            title={isExpanded ? 'Collapse Assignee Breakdown' : 'Expand Assignee Breakdown'}
                                                        >
                                                            {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                                                        </button>
                                                    )}
                                                    <span className="kpi-matrix-kpi-title" title={row.name}>
                                                        {row.name}
                                                    </span>
                                                </div>
                                                <div className="kpi-matrix-kpi-sub">
                                                    {row.unit && <span className="kpi-matrix-kpi-badge">{row.unit}</span>}
                                                    <span>{row.category}</span>
                                                    {hasAssignees && (
                                                        <span
                                                            onClick={() => toggleExpand(row.id)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                padding: '1px 8px',
                                                                borderRadius: 10,
                                                                background: hasMultipleAssignees ? '#e0f2fe' : '#f1f5f9',
                                                                color: hasMultipleAssignees ? '#0369a1' : '#334155',
                                                                fontWeight: 700,
                                                                fontSize: '0.72rem',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                            title="Click to toggle assignee breakdown"
                                                        >
                                                            {hasMultipleAssignees ? `👥 ${assigneesList.length} Assignees` : `👤 ${assigneesList[0].user_name}`}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Annual Target */}
                                            <td className="cell-target">
                                                {row.target_value ? (
                                                    <span>{formatVal(row.target_value)}</span>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>—</span>
                                                )}
                                            </td>

                                            {/* 12 Month Cells */}
                                            {MONTHS.map(m => {
                                                const actualsList = row.months[m.num] || [];

                                                if (actualsList.length === 1) {
                                                    const actual = actualsList[0];
                                                    const status = (actual.status || 'PENDING').toLowerCase();
                                                    const statusClass = `status-${status}`;
                                                    return (
                                                        <td key={m.num} style={{ padding: '4px' }}>
                                                            <div
                                                                className={`kpi-matrix-cell has-value ${statusClass}`}
                                                                onClick={() => onCellClick && onCellClick(actual)}
                                                                title={`${m.full} ${year}: ${actual.actual_value} (${actual.status_display || actual.status})\nSubmitted by: ${actual.user_full_name || actual.user_email || 'Staff'}`}
                                                            >
                                                                <span className="kpi-matrix-cell-val">
                                                                    {formatVal(actual.actual_value)}
                                                                </span>
                                                                <span className="kpi-matrix-cell-pill">
                                                                    {status === 'approved' ? 'Appr' : status === 'rejected' ? 'Rej' : 'Pend'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                if (actualsList.length > 1) {
                                                    const sumVal = actualsList.reduce((acc, a) => acc + (Number(a.actual_value) || 0), 0);
                                                    const approvedCount = actualsList.filter(a => (a.status || '').toUpperCase() === 'APPROVED').length;
                                                    const pendingCount = actualsList.filter(a => (a.status || '').toUpperCase() === 'PENDING').length;

                                                    return (
                                                        <td key={m.num} style={{ padding: '4px' }}>
                                                            <div
                                                                className="kpi-matrix-cell has-value status-multi"
                                                                onClick={() => toggleExpand(row.id)}
                                                                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', cursor: 'pointer' }}
                                                                title={`${m.full} ${year}: Total ${sumVal} (${actualsList.length} submissions)\nClick to expand team breakdown`}
                                                            >
                                                                <span className="kpi-matrix-cell-val" style={{ color: '#15803d', fontWeight: 700 }}>
                                                                    {formatVal(sumVal)}
                                                                </span>
                                                                <span className="kpi-matrix-cell-pill" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.65rem' }}>
                                                                    {approvedCount}/{actualsList.length} Appr
                                                                </span>
                                                            </div>
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={m.num} style={{ padding: '4px' }}>
                                                        <div
                                                            className="kpi-matrix-cell empty"
                                                            onClick={() => onAddClick && onAddClick({ kpi_id: row.id, year, month: m.num })}
                                                            title={`Click to submit actual for ${m.full} ${year}`}
                                                        >
                                                            <span className="kpi-matrix-cell-dash">—</span>
                                                            <span className="kpi-matrix-cell-add-icon">
                                                                <FiPlus size={11} /> Log
                                                            </span>
                                                        </div>
                                                    </td>
                                                );
                                            })}

                                            {/* YTD Summary */}
                                            <td className="cell-ytd">
                                                <div className="kpi-matrix-ytd-val">
                                                    {submissionCount > 0 ? formatVal(ytdDisplayVal) : '—'}
                                                </div>
                                                {progressPct !== null && submissionCount > 0 && (
                                                    <>
                                                        <div className="kpi-matrix-ytd-bar-container">
                                                            <div
                                                                className="kpi-matrix-ytd-bar-fill"
                                                                style={{ width: `${progressPct}%` }}
                                                            />
                                                        </div>
                                                        <div className="kpi-matrix-ytd-pct">{progressPct}% of target</div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Nested Sub-rows for each Employee */}
                                        {isExpanded && hasAssignees && assigneesList.map(assignee => {
                                            let assigneeYtd = 0;
                                            let assigneeSubmissions = 0;
                                            MONTHS.forEach(m => {
                                                const a = assignee.months[m.num];
                                                if (a) {
                                                    assigneeYtd += (Number(a.actual_value) || 0);
                                                    assigneeSubmissions += 1;
                                                }
                                            });

                                            return (
                                                <tr key={`${row.id}-${assignee.user_id}`} className="kpi-assignee-subrow" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                    <td className="cell-kpi" style={{ paddingLeft: '2.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <FiUser size={13} color="#0284c7" />
                                                            <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                                                {assignee.user_name}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', paddingLeft: '19px' }}>
                                                            {assignee.user_email}
                                                        </div>
                                                    </td>

                                                    {/* Assignee Target */}
                                                    <td className="cell-target" style={{ fontSize: '0.85rem', color: '#475569' }}>
                                                        {assignee.target_value ? formatVal(assignee.target_value) : '—'}
                                                    </td>

                                                    {/* Assignee Months 1-12 */}
                                                    {MONTHS.map(m => {
                                                        const actual = assignee.months[m.num];
                                                        if (actual) {
                                                            const status = (actual.status || 'PENDING').toLowerCase();
                                                            const statusClass = `status-${status}`;
                                                            return (
                                                                <td key={m.num} style={{ padding: '4px' }}>
                                                                    <div
                                                                        className={`kpi-matrix-cell has-value ${statusClass}`}
                                                                        onClick={() => onCellClick && onCellClick(actual)}
                                                                        title={`${assignee.user_name} - ${m.full} ${year}: ${actual.actual_value} (${actual.status_display || actual.status})`}
                                                                    >
                                                                        <span className="kpi-matrix-cell-val">
                                                                            {formatVal(actual.actual_value)}
                                                                        </span>
                                                                        <span className="kpi-matrix-cell-pill">
                                                                            {status === 'approved' ? 'Appr' : status === 'rejected' ? 'Rej' : 'Pend'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            );
                                                        }

                                                        return (
                                                            <td key={m.num} style={{ padding: '4px' }}>
                                                                <div
                                                                    className="kpi-matrix-cell empty"
                                                                    style={{ opacity: 0.65, cursor: 'pointer' }}
                                                                    onClick={() => onAddClick && onAddClick({ kpi_id: row.id, year, month: m.num, user_id: assignee.user_id })}
                                                                    title={`Click to log actual for ${assignee.user_name} (${m.full} ${year})`}
                                                                >
                                                                    <span className="kpi-matrix-cell-dash">—</span>
                                                                    <span className="kpi-matrix-cell-add-icon">
                                                                        <FiPlus size={10} /> Log
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}

                                                    {/* Assignee YTD */}
                                                    <td className="cell-ytd">
                                                        <div className="kpi-matrix-ytd-val" style={{ fontSize: '0.85rem' }}>
                                                            {assigneeSubmissions > 0 ? formatVal(assigneeYtd) : '—'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Legend */}
            <div className="kpi-actual-matrix-footer">
                <div className="kpi-matrix-legend">
                    <div className="kpi-matrix-legend-item">
                        <span className="kpi-matrix-legend-dot legend-approved" />
                        <span>Approved</span>
                    </div>
                    <div className="kpi-matrix-legend-item">
                        <span className="kpi-matrix-legend-dot legend-pending" />
                        <span>Pending Validation</span>
                    </div>
                    <div className="kpi-matrix-legend-item">
                        <span className="kpi-matrix-legend-dot legend-rejected" />
                        <span>Rejected</span>
                    </div>
                    <div className="kpi-matrix-legend-item">
                        <span className="kpi-matrix-legend-dot legend-empty" />
                        <span>Click empty cell to log actual</span>
                    </div>
                </div>

                <div>
                    Total Indicators: <strong>{filteredRows.length}</strong>
                </div>
            </div>
        </div>
    );
};

export default ActualMatrixGrid;
